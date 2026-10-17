import {
  ChannelType,
  Guild,
  GuildMember,
  OverwriteResolvable,
  OverwriteType,
  PermissionFlagsBits,
  TextChannel,
} from 'discord.js';
import { readJson, writeJson } from '../database/jsonDatabase.js';
import { serverScanService } from './serverScanService.js';
import { serverConfigService } from './serverConfigService.js';
import { ChannelRef, ProposalObservation, RulesSource, generateRules, MAX_RULES_LENGTH } from './serverRulesService.js';
import { DetectedBot, ServerSettings } from '../types/serverSettings.js';
import { logger } from '../utils/logger.js';
import { randomString, truncate } from '../utils/stringUtils.js';

/**
 * Fluxo "escanear → propor → o dono edita/aprova → aplicar → desfazer".
 * Nada é alterado no servidor até o dono aprovar. Só itens marcados (enabled) são executados.
 * Nunca renomeia, move ou apaga algo que já existia; o que existe de "melhoria" é opt-in.
 */

export type ProposalGroup = 'config' | 'rules' | 'create' | 'improve';
export type ProposalItemKind =
  | 'setting'
  | 'features'
  | 'automod'
  | 'theme'
  | 'post_rules'
  | 'create_channel'
  | 'create_role'
  | 'everyone_perms';

export interface ProposalItem {
  id: string;
  group: ProposalGroup;
  kind: ProposalItemKind;
  label: string;
  detail: string;
  enabled: boolean;
  payload: Record<string, unknown>;
}

export interface ServerProposal {
  id: string;
  guildId: string;
  createdAt: number;
  expiresAt: number;
  status: 'pending' | 'applied' | 'cancelled';
  observation: ProposalObservation;
  facts: string[];
  detectedBots: DetectedBot[];
  rulesText: string;
  rulesSource: RulesSource;
  items: ProposalItem[];
}

export interface ApplyResult {
  undoId: string;
  done: string[];
  skipped: string[];
  failures: string[];
}

export interface ProposalUndoRecord {
  id: string;
  proposalId: string;
  guildId: string;
  createdAt: number;
  previousSettings: Record<string, unknown>;
  createdRoleIds: string[];
  createdChannelIds: string[];
  postedMessages: { channelId: string; messageId: string }[];
  everyoneRemoved: string[];
}

type ChannelPurpose = 'rules' | 'modlog' | 'welcome';

const PROPOSALS_FILE = 'server_proposals';
const UNDO_FILE = 'server_proposal_undo';
const PROPOSAL_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_STORED_PROPOSALS = 20;
const REASON = 'Proposta de configuração aprovada pelo dono (Patito)';

const PATTERN_RULES = /regra|rules/i;
const PATTERN_BOT = /comando|bot|cmd|commands/i;
const PATTERN_ADS = /divulg|propaganda|parceri|promo|(^|-)ads?(-|$)/i;
const PATTERN_SUPPORT = /suporte|ticket|ajuda|atendimento|help|support/i;

type PermKey = keyof typeof PermissionFlagsBits;
const DANGEROUS_EVERYONE_PERMS: { key: PermKey; label: string }[] = [
  { key: 'Administrator', label: 'Administrador' },
  { key: 'ManageGuild', label: 'Gerenciar servidor' },
  { key: 'ManageRoles', label: 'Gerenciar cargos' },
  { key: 'ManageChannels', label: 'Gerenciar canais' },
  { key: 'ManageWebhooks', label: 'Gerenciar webhooks' },
  { key: 'KickMembers', label: 'Expulsar' },
  { key: 'BanMembers', label: 'Banir' },
  { key: 'ModerateMembers', label: 'Castigar (timeout)' },
  { key: 'MentionEveryone', label: 'Mencionar @everyone' },
  { key: 'ManageMessages', label: 'Gerenciar mensagens' },
];

// ---------------------------------------------------------------- persistência

function loadAll(): ServerProposal[] {
  return readJson<ServerProposal[]>(PROPOSALS_FILE, []);
}

function loadUndo(): ProposalUndoRecord[] {
  return readJson<ProposalUndoRecord[]>(UNDO_FILE, []);
}

// ---------------------------------------------------------------- helpers

function refOf(c: { id: string; name: string } | null | undefined): ChannelRef | null {
  return c ? { id: c.id, name: c.name } : null;
}

function findChannel(channels: ChannelRef[], pattern: RegExp, exclude: RegExp[] = []): ChannelRef | null {
  return channels.find((c) => pattern.test(c.name) && !exclude.some((e) => e.test(c.name))) ?? null;
}

function buildOverwrites(guild: Guild, me: GuildMember | null, purpose: ChannelPurpose, staffRoleId: string | null): OverwriteResolvable[] {
  const list: OverwriteResolvable[] = [];
  if (purpose === 'rules') {
    // Canal de regras: todo mundo lê, só a staff/bot escreve.
    list.push({ id: guild.roles.everyone.id, type: OverwriteType.Role, deny: [PermissionFlagsBits.SendMessages] });
    if (me) {
      list.push({
        id: me.id,
        type: OverwriteType.Member,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }
  } else if (purpose === 'modlog') {
    // Canal de logs: privado. O bot precisa continuar enxergando e escrevendo nele.
    list.push({ id: guild.roles.everyone.id, type: OverwriteType.Role, deny: [PermissionFlagsBits.ViewChannel] });
    if (me) {
      list.push({
        id: me.id,
        type: OverwriteType.Member,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      });
    }
    if (staffRoleId) {
      list.push({
        id: staffRoleId,
        type: OverwriteType.Role,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
      });
    }
  }
  return list;
}

// ---------------------------------------------------------------- serviço

export const serverProposalService = {
  get(id: string): ServerProposal | null {
    return loadAll().find((p) => p.id === id) ?? null;
  },

  /** Só devolve se ainda estiver pendente e dentro do prazo. */
  getPending(id: string): ServerProposal | null {
    const p = this.get(id);
    if (!p || p.status !== 'pending' || p.expiresAt < Date.now()) return null;
    return p;
  },

  async save(proposal: ServerProposal): Promise<void> {
    const all = loadAll();
    const idx = all.findIndex((p) => p.id === proposal.id);
    if (idx === -1) all.push(proposal);
    else all[idx] = proposal;
    await writeJson(PROPOSALS_FILE, all.slice(-MAX_STORED_PROPOSALS));
  },

  /**
   * Lê o servidor e monta a proposta. NÃO altera nada.
   * Itens que já estão iguais ao que seria feito são omitidos.
   */
  async build(guild: Guild): Promise<ServerProposal> {
    const settings = serverConfigService.getSettings(guild.id);
    const plan = await serverScanService.buildFullPlan(guild);
    const items: ProposalItem[] = [];
    let counter = 0;
    const nextId = (): string => `i${++counter}`;

    // ---- observação do servidor
    const textChannels: ChannelRef[] = guild.channels.cache
      .filter((c) => c.type === ChannelType.GuildText)
      .map((c) => ({ id: c.id, name: c.name }));
    const voiceChannelCount = guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).size;
    const categoryCount = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory).size;

    const rulesChannel = findChannel(textChannels, PATTERN_RULES);
    const botChannel = findChannel(textChannels, PATTERN_BOT, [PATTERN_RULES, /log/i]);
    const adsChannel = findChannel(textChannels, PATTERN_ADS);
    const supportChannel = findChannel(textChannels, PATTERN_SUPPORT);
    const hasTicketCategory = Boolean(plan.settingsPatch.ticketCategoryId ?? settings.ticketCategoryId);

    const observation: ProposalObservation = {
      guildName: guild.name,
      theme: plan.detectedTheme,
      confidence: plan.confidence,
      textChannelCount: textChannels.length,
      voiceChannelCount,
      categoryCount,
      roleCount: guild.roles.cache.size,
      rulesChannel: refOf(rulesChannel),
      botChannel: refOf(botChannel),
      adsChannel: refOf(adsChannel),
      supportChannel: refOf(supportChannel),
      hasTicketCategory,
      bots: plan.detectedBots,
    };

    const facts: string[] = [
      `${textChannels.length} canais de texto, ${voiceChannelCount} de voz, ${categoryCount} categorias, ${guild.roles.cache.size} cargos`,
      plan.detectedBots.length ? `Outros bots: ${plan.detectedBots.map((b) => b.name).join(', ')}` : 'Nenhum outro bot',
      rulesChannel ? `Canal de regras: #${rulesChannel.name}` : 'Sem canal de regras',
    ];

    // ---- configurações (reconhecidas pelo nome)
    for (const m of plan.matches) {
      const key = m.setting;
      const current = (settings as unknown as Record<string, unknown>)[key];
      if (current === m.channelId) continue;

      const shown = key === 'ticketSupportRoleId' ? `@${m.channelName}` : key === 'ticketCategoryId' ? `📁 ${m.channelName}` : `#${m.channelName}`;
      const hasOther = typeof current === 'string' && current.length > 0;
      items.push({
        id: nextId(),
        group: 'config',
        kind: 'setting',
        label: truncate(`${m.label}: ${shown}`, 90),
        detail: hasOther ? 'Já há outro valor configurado — ative só se quiser trocar' : 'Reconhecido pelo nome',
        enabled: !hasOther,
        payload: { key, value: m.channelId },
      });
    }

    const feat = plan.settingsPatch.features;
    const curFeat = settings.features ?? { welcome: true, goodbye: true, leveling: true };
    if (feat && (feat.welcome !== curFeat.welcome || feat.goodbye !== curFeat.goodbye || feat.leveling !== curFeat.leveling)) {
      const onoff = (v: boolean): string => (v ? 'liga' : 'desliga');
      items.push({
        id: nextId(),
        group: 'config',
        kind: 'features',
        label: truncate(`Funções: boas-vindas ${onoff(feat.welcome)}, despedida ${onoff(feat.goodbye)}, níveis ${onoff(feat.leveling)}`, 90),
        detail: truncate(plan.detectedBots.length ? `Evita duplicar o que ${plan.detectedBots.map((b) => b.name).join(', ')} já faz` : 'Ajuste padrão', 95),
        enabled: true,
        payload: { features: feat },
      });
    }

    const am = plan.settingsPatch.automod;
    const curAm = settings.automod;
    if (am && curAm) {
      // Só liga proteções; nunca desliga nem apaga palavras banidas já configuradas.
      const merged = {
        antiSpam: am.antiSpam || curAm.antiSpam,
        antiLinks: am.antiLinks || curAm.antiLinks,
        antiInvites: am.antiInvites || curAm.antiInvites,
        antiCaps: am.antiCaps || curAm.antiCaps,
        bannedWords: curAm.bannedWords ?? [],
      };
      if (
        merged.antiSpam !== curAm.antiSpam ||
        merged.antiLinks !== curAm.antiLinks ||
        merged.antiInvites !== curAm.antiInvites ||
        merged.antiCaps !== curAm.antiCaps
      ) {
        const on = [merged.antiSpam && 'anti-spam', merged.antiLinks && 'anti-link', merged.antiInvites && 'anti-convite', merged.antiCaps && 'anti-caps'].filter(Boolean);
        items.push({
          id: nextId(),
          group: 'config',
          kind: 'automod',
          label: truncate(`Automod: ${on.join(', ')}`, 90),
          detail: 'Nenhum outro bot de moderação encontrado — conjunto seguro',
          enabled: true,
          payload: { automod: merged },
        });
      }
    }

    if (plan.detectedTheme !== 'default' && settings.theme !== plan.detectedTheme) {
      items.push({
        id: nextId(),
        group: 'config',
        kind: 'theme',
        label: truncate(`Tema do servidor: ${plan.detectedTheme} (${plan.confidence}%)`, 90),
        detail: 'Detectado pelos nomes de canais e cargos',
        enabled: plan.confidence >= 40,
        payload: { theme: plan.detectedTheme, confidence: plan.confidence },
      });
    }

    // ---- regras
    const rules = await generateRules(observation);
    let rulesHasMessages = false;
    if (rulesChannel) {
      try {
        const ch = guild.channels.cache.get(rulesChannel.id) as TextChannel | undefined;
        const last = ch ? await ch.messages.fetch({ limit: 1 }) : null;
        rulesHasMessages = Boolean(last && last.size > 0);
      } catch {
        rulesHasMessages = false;
      }
    }
    items.push({
      id: nextId(),
      group: 'rules',
      kind: 'post_rules',
      label: truncate(rulesChannel ? `Publicar as regras em #${rulesChannel.name}` : 'Publicar as regras no novo canal #regras', 90),
      detail: rulesHasMessages ? 'O canal já tem mensagens — ative só se quiser publicar mesmo assim' : 'Texto abaixo; dá para editar antes de aplicar',
      enabled: !rulesHasMessages,
      payload: { channelId: rulesChannel?.id ?? null },
    });

    // ---- o que falta (criar)
    if (!rulesChannel) {
      items.push({
        id: nextId(),
        group: 'create',
        kind: 'create_channel',
        label: 'Criar canal #regras (somente leitura)',
        detail: 'Hoje não existe canal de regras',
        enabled: true,
        payload: { purpose: 'rules' satisfies ChannelPurpose, name: 'regras', topic: 'Regras do servidor' },
      });
    }

    const hasModLog = Boolean(settings.modLogChannelId || plan.settingsPatch.modLogChannelId);
    if (!hasModLog) {
      items.push({
        id: nextId(),
        group: 'create',
        kind: 'create_channel',
        label: 'Criar canal privado #logs-moderação',
        detail: 'Para os registros de moderação; só staff e bot enxergam',
        enabled: true,
        payload: { purpose: 'modlog' satisfies ChannelPurpose, name: 'logs-moderação', topic: 'Registros de moderação do Patito', bindSetting: 'modLogChannelId' },
      });
    }

    const welcomeOn = feat ? feat.welcome : curFeat.welcome;
    const hasWelcome = Boolean(settings.welcomeChannelId || plan.settingsPatch.welcomeChannelId);
    if (welcomeOn && !hasWelcome) {
      items.push({
        id: nextId(),
        group: 'create',
        kind: 'create_channel',
        label: 'Criar canal #bem-vindo',
        detail: 'O Patito vai recepcionar os novos membros nele',
        enabled: true,
        payload: { purpose: 'welcome' satisfies ChannelPurpose, name: 'bem-vindo', topic: 'Boas-vindas aos novos membros', bindSetting: 'welcomeChannelId' },
      });
    }

    const hasStaffRole = Boolean(settings.ticketSupportRoleId || plan.settingsPatch.ticketSupportRoleId);
    if (!hasStaffRole) {
      items.push({
        id: nextId(),
        group: 'create',
        kind: 'create_role',
        label: 'Criar cargo @Staff',
        detail: 'Sem permissões extras; serve de cargo de suporte para tickets e logs',
        enabled: true,
        payload: { name: 'Staff', color: 0x5865f2, hoist: true, isStaff: true, bindSetting: 'ticketSupportRoleId' },
      });
    }

    // ---- melhorias (opt-in: mexem no que já existe)
    const everyone = guild.roles.everyone;
    const present = DANGEROUS_EVERYONE_PERMS.filter((d) => everyone.permissions.has(PermissionFlagsBits[d.key]));
    if (present.length > 0) {
      items.push({
        id: nextId(),
        group: 'improve',
        kind: 'everyone_perms',
        label: truncate(`⚠️ Tirar de @everyone: ${present.map((p) => p.label).join(', ')}`, 95),
        detail: 'Hoje qualquer membro tem esses poderes. Dá para desfazer.',
        enabled: false,
        payload: { perms: present.map((p) => p.key) },
      });
      facts.push(`@everyone com ${present.length} permissão(ões) perigosa(s)`);
    }

    const proposal: ServerProposal = {
      id: randomString(10),
      guildId: guild.id,
      createdAt: Date.now(),
      expiresAt: Date.now() + PROPOSAL_TTL_MS,
      status: 'pending',
      observation,
      facts,
      detectedBots: plan.detectedBots,
      rulesText: rules.text,
      rulesSource: rules.source,
      items,
    };
    await this.save(proposal);
    return proposal;
  },

  /** Regera só o texto das regras (usa IA se houver chave; senão volta o modelo). */
  async regenerateRules(proposal: ServerProposal): Promise<ServerProposal> {
    const rules = await generateRules(proposal.observation);
    proposal.rulesText = rules.text;
    proposal.rulesSource = rules.source;
    await this.save(proposal);
    return proposal;
  },

  async setRulesText(proposal: ServerProposal, text: string): Promise<ServerProposal> {
    proposal.rulesText = text.trim().slice(0, MAX_RULES_LENGTH);
    proposal.rulesSource = 'editado';
    await this.save(proposal);
    return proposal;
  },

  async setEnabled(proposal: ServerProposal, enabledIds: string[]): Promise<ServerProposal> {
    const on = new Set(enabledIds);
    // O menu mostra no máximo 25 itens (limite do Discord); só esses são controlados por ele.
    for (const item of proposal.items.slice(0, 25)) item.enabled = on.has(item.id);
    await this.save(proposal);
    return proposal;
  },

  async cancel(proposal: ServerProposal): Promise<void> {
    proposal.status = 'cancelled';
    await this.save(proposal);
  },

  /**
   * Executa SOMENTE os itens marcados. Cada item falha de forma isolada.
   * Registra tudo o que foi criado/alterado para o /autoconfig desfazer.
   */
  async apply(guild: Guild, proposal: ServerProposal): Promise<ApplyResult> {
    // Marca como usada antes de executar: clique duplo não aplica duas vezes.
    proposal.status = 'applied';
    await this.save(proposal);

    const me: GuildMember | null = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
    const done: string[] = [];
    const skipped: string[] = [];
    const failures: string[] = [];
    const createdRoleIds: string[] = [];
    const createdChannelIds: string[] = [];
    const postedMessages: { channelId: string; messageId: string }[] = [];
    let everyoneRemoved: string[] = [];

    const settings = serverConfigService.getSettings(guild.id);
    const patch: Record<string, unknown> = {};
    const enabled = proposal.items.filter((i) => i.enabled);
    const canChannels = me?.permissions.has(PermissionFlagsBits.ManageChannels) ?? false;
    const canRoles = me?.permissions.has(PermissionFlagsBits.ManageRoles) ?? false;

    let staffRoleId: string | null = settings.ticketSupportRoleId ?? null;
    let createdRulesChannel: TextChannel | null = null;

    // 1) cargos
    for (const item of enabled.filter((i) => i.kind === 'create_role')) {
      const p = item.payload as { name: string; color: number; hoist: boolean; isStaff?: boolean; bindSetting?: string };
      try {
        const existing = guild.roles.cache.find((r) => r.name === p.name);
        if (existing) {
          skipped.push(`Cargo @${p.name} já existia — reaproveitado`);
          if (p.bindSetting) patch[p.bindSetting] = existing.id;
          if (p.isStaff) staffRoleId = existing.id;
          continue;
        }
        if (!canRoles) {
          failures.push(`Cargo @${p.name}: falta a permissão "Gerenciar Cargos".`);
          continue;
        }
        const role = await guild.roles.create({ name: p.name, color: p.color, hoist: p.hoist, mentionable: false, reason: REASON });
        createdRoleIds.push(role.id);
        done.push(`Cargo criado: @${role.name}`);
        if (p.bindSetting) patch[p.bindSetting] = role.id;
        if (p.isStaff) staffRoleId = role.id;
      } catch (err) {
        failures.push(`Cargo @${p.name}: ${(err as Error).message}`);
      }
    }

    // 2) canais
    for (const item of enabled.filter((i) => i.kind === 'create_channel')) {
      const p = item.payload as { purpose: ChannelPurpose; name: string; topic?: string; bindSetting?: string };
      try {
        const existing = guild.channels.cache.find((c) => c.type === ChannelType.GuildText && c.name === p.name.toLowerCase());
        if (existing) {
          skipped.push(`Canal #${p.name} já existia — reaproveitado`);
          if (p.bindSetting) patch[p.bindSetting] = existing.id;
          if (p.purpose === 'rules') createdRulesChannel = existing as TextChannel;
          continue;
        }
        if (!canChannels) {
          failures.push(`Canal #${p.name}: falta a permissão "Gerenciar Canais".`);
          continue;
        }
        const channel = await guild.channels.create({
          name: p.name,
          type: ChannelType.GuildText,
          topic: p.topic,
          permissionOverwrites: buildOverwrites(guild, me, p.purpose, staffRoleId),
          reason: REASON,
        });
        createdChannelIds.push(channel.id);
        done.push(`Canal criado: #${channel.name}`);
        if (p.bindSetting) patch[p.bindSetting] = channel.id;
        if (p.purpose === 'rules') createdRulesChannel = channel as TextChannel;
      } catch (err) {
        failures.push(`Canal #${p.name}: ${(err as Error).message}`);
      }
    }

    // 3) configurações
    let settingCount = 0;
    for (const item of enabled) {
      if (item.kind === 'setting') {
        const { key, value } = item.payload as { key: string; value: string };
        const stillExists = key === 'ticketSupportRoleId' ? guild.roles.cache.has(value) : guild.channels.cache.has(value);
        if (!stillExists) {
          failures.push(`${item.label}: o alvo não existe mais.`);
          continue;
        }
        patch[key] = value;
        settingCount++;
      } else if (item.kind === 'features') {
        patch.features = (item.payload as { features: unknown }).features;
        settingCount++;
      } else if (item.kind === 'automod') {
        patch.automod = (item.payload as { automod: unknown }).automod;
        settingCount++;
      } else if (item.kind === 'theme') {
        const t = item.payload as { theme: string; confidence: number };
        patch.theme = t.theme;
        patch.themeConfidence = t.confidence;
        settingCount++;
      }
    }
    patch.detectedBots = proposal.detectedBots;
    patch.autoConfigured = true;
    patch.autoConfigProposed = true;

    const previousSettings: Record<string, unknown> = {};
    for (const key of Object.keys(patch)) {
      previousSettings[key] = (settings as unknown as Record<string, unknown>)[key];
    }
    try {
      await serverConfigService.update(guild.id, patch as Partial<ServerSettings>);
      const bound = Object.keys(patch).filter((k) => k.endsWith('ChannelId') || k === 'ticketSupportRoleId').length;
      if (settingCount > 0 || bound > 0) done.push(`Configurações salvas (${settingCount} ajuste(s) aprovado(s))`);
    } catch (err) {
      failures.push(`Não consegui salvar as configurações: ${(err as Error).message}`);
    }

    // 4) regras
    const rulesItem = enabled.find((i) => i.kind === 'post_rules');
    if (rulesItem) {
      try {
        const existingId = (rulesItem.payload as { channelId: string | null }).channelId;
        const target = createdRulesChannel ?? (existingId ? (guild.channels.cache.get(existingId) as TextChannel | undefined) : undefined);
        if (!target || target.type !== ChannelType.GuildText) {
          failures.push('Regras: não há canal de regras para publicar (ative "Criar canal #regras").');
        } else if (!proposal.rulesText.trim()) {
          failures.push('Regras: o texto está vazio.');
        } else if (me && !target.permissionsFor(me)?.has(PermissionFlagsBits.SendMessages)) {
          failures.push(`Regras: não tenho permissão para escrever em #${target.name}.`);
        } else {
          const msg = await target.send({ content: proposal.rulesText.slice(0, MAX_RULES_LENGTH), allowedMentions: { parse: [] } });
          postedMessages.push({ channelId: target.id, messageId: msg.id });
          done.push(`Regras publicadas em #${target.name}`);
        }
      } catch (err) {
        failures.push(`Regras: ${(err as Error).message}`);
      }
    }

    // 5) melhorias
    const everyoneItem = enabled.find((i) => i.kind === 'everyone_perms');
    if (everyoneItem) {
      try {
        if (!canRoles) {
          failures.push('Permissões do @everyone: falta a permissão "Gerenciar Cargos".');
        } else {
          const names = (everyoneItem.payload as { perms: PermKey[] }).perms;
          const everyone = guild.roles.everyone;
          const toRemove = names.filter((n) => everyone.permissions.has(PermissionFlagsBits[n]));
          if (toRemove.length === 0) {
            skipped.push('Permissões do @everyone: já estavam removidas');
          } else {
            await everyone.setPermissions(everyone.permissions.remove(...toRemove.map((n) => PermissionFlagsBits[n])), REASON);
            everyoneRemoved = toRemove;
            done.push(`Removido de @everyone: ${toRemove.length} permissão(ões)`);
          }
        }
      } catch (err) {
        failures.push(`Permissões do @everyone: ${(err as Error).message}`);
      }
    }

    // registro para desfazer
    const undoId = `${guild.id}-${Date.now()}`;
    const undo = loadUndo();
    undo.push({
      id: undoId,
      proposalId: proposal.id,
      guildId: guild.id,
      createdAt: Date.now(),
      previousSettings,
      createdRoleIds,
      createdChannelIds,
      postedMessages,
      everyoneRemoved,
    });
    await writeJson(UNDO_FILE, undo.slice(-50));

    logger.info(
      'serverProposalService',
      `Proposta ${proposal.id} aplicada em ${guild.id}: ${done.length} feito(s), ${skipped.length} pulado(s), ${failures.length} falha(s).`
    );
    return { undoId, done, skipped, failures };
  },

  getUndoHistory(guildId: string): ProposalUndoRecord[] {
    return loadUndo().filter((r) => r.guildId === guildId);
  },

  /**
   * Desfaz uma aplicação: apaga SÓ o que ela criou, apaga as mensagens de regras que ela postou,
   * devolve as configurações anteriores e recoloca as permissões que tirou do @everyone.
   */
  async undo(guild: Guild, undoId: string): Promise<{ messages: number; channels: number; roles: number; settings: boolean; everyone: number }> {
    const all = loadUndo();
    const record = all.find((r) => r.id === undoId && r.guildId === guild.id);
    if (!record) throw new Error('Registro não encontrado para este servidor.');

    let messages = 0;
    let channels = 0;
    let roles = 0;
    let everyone = 0;

    for (const m of record.postedMessages) {
      try {
        const ch = guild.channels.cache.get(m.channelId) as TextChannel | undefined;
        if (ch) {
          await ch.messages.delete(m.messageId);
          messages++;
        }
      } catch {
        // mensagem já apagada
      }
    }

    for (const id of [...record.createdChannelIds].reverse()) {
      try {
        const ch = guild.channels.cache.get(id);
        if (ch) {
          await ch.delete('Desfazendo proposta do Patito');
          channels++;
        }
      } catch {
        // segue com os outros
      }
    }

    for (const id of [...record.createdRoleIds].reverse()) {
      try {
        const role = guild.roles.cache.get(id);
        if (role) {
          await role.delete('Desfazendo proposta do Patito');
          roles++;
        }
      } catch {
        // segue com os outros
      }
    }

    let settingsRestored = false;
    try {
      await serverConfigService.update(guild.id, record.previousSettings as Partial<ServerSettings>);
      settingsRestored = true;
    } catch (err) {
      logger.error('serverProposalService', `Falha ao restaurar configurações de ${guild.id}: ${err}`);
    }

    if (record.everyoneRemoved.length > 0) {
      try {
        const everyoneRole = guild.roles.everyone;
        await everyoneRole.setPermissions(
          everyoneRole.permissions.add(...record.everyoneRemoved.map((n) => PermissionFlagsBits[n as PermKey])),
          'Desfazendo proposta do Patito'
        );
        everyone = record.everyoneRemoved.length;
      } catch (err) {
        logger.error('serverProposalService', `Falha ao restaurar permissões do @everyone em ${guild.id}: ${err}`);
      }
    }

    await writeJson(
      UNDO_FILE,
      all.filter((r) => r.id !== undoId)
    );
    return { messages, channels, roles, settings: settingsRestored, everyone };
  },
};
