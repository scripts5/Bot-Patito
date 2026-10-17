import { ChannelType, Guild, OverwriteResolvable, PermissionFlagsBits, Role } from 'discord.js';
import { buildFullRoleSet, RoleBlueprint } from '../config/rolesConfig.js';
import { getChannelThemeFor, CategoryBlueprint } from '../config/channelsConfig.js';
import { readJson, writeJson } from '../database/jsonDatabase.js';
import { logger } from '../utils/logger.js';

export interface ServerCreationPlan {
  guildId: string;
  description: string;
  newName: string | null;
  roles: RoleBlueprint[];
  categories: CategoryBlueprint[];
  rulesText: string;
}

export interface ServerCreationRecord {
  id: string;
  guildId: string;
  createdAt: number;
  createdRoleIds: string[];
  createdChannelIds: string[];
  renamedFrom: string | null;
}

const FILE = 'server_creations';

// Planos aguardando confirmação por botão (expira em 5 minutos).
const pendingPlans = new Map<string, { plan: ServerCreationPlan; expiresAt: number }>();

export function storePendingPlan(token: string, plan: ServerCreationPlan): void {
  pendingPlans.set(token, { plan, expiresAt: Date.now() + 5 * 60_000 });
}

export function takePendingPlan(token: string): ServerCreationPlan | null {
  const entry = pendingPlans.get(token);
  pendingPlans.delete(token);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.plan;
}

function buildRulesText(description: string): string {
  return [
    '📜 **REGRAS DO SERVIDOR**',
    '',
    `Bem-vindo(a)! Este servidor é sobre: **${description}**.`,
    '',
    '1️⃣ Respeite todos os membros. Não toleramos discurso de ódio, assédio ou bullying.',
    '2️⃣ Nada de spam, flood ou propaganda não autorizada.',
    '3️⃣ Conteúdo NSFW, ilegal ou ofensivo é proibido.',
    '4️⃣ Use os canais para o que eles foram criados.',
    '5️⃣ Siga as instruções da equipe de staff.',
    '6️⃣ Proibido se passar por outra pessoa ou pela staff.',
    '7️⃣ Convites de outros servidores só com autorização da staff.',
    '',
    '🚨 O descumprimento das regras pode resultar em avisos, timeout, kick ou ban.',
    '',
    'Divirta-se! 🎉',
  ].join('\n');
}

export const serverCreationService = {
  /**
   * Gera o plano de criação (não cria nada ainda) a partir da descrição do tema.
   * Usado para montar a prévia antes da confirmação do dono.
   */
  buildPlan(guildId: string, description: string, newName: string | null): ServerCreationPlan {
    return {
      guildId,
      description,
      newName,
      roles: buildFullRoleSet(description),
      categories: getChannelThemeFor(description),
      rulesText: buildRulesText(description),
    };
  },

  /**
   * Executa o plano de fato: renomeia (se pedido), cria cargos, cria categorias/canais
   * com permissões (staff-only quando aplicável), posta as regras.
   * Pula duplicados (nunca recria cargo/canal com nome já existente).
   * Nunca apaga nada. Registra tudo para possível rollback.
   */
  async execute(guild: Guild, plan: ServerCreationPlan): Promise<{
    record: ServerCreationRecord;
    createdRoles: string[];
    skippedRoles: string[];
    createdChannels: string[];
    skippedChannels: string[];
    failures: string[];
    renamed: boolean;
  }> {
    const createdRoles: string[] = [];
    const skippedRoles: string[] = [];
    const createdChannels: string[] = [];
    const skippedChannels: string[] = [];
    const failures: string[] = [];
    const createdRoleIds: string[] = [];
    const createdChannelIds: string[] = [];
    const renamedFrom = guild.name;
    let renamed = false;

    // 1. Renomear (se solicitado e diferente do atual)
    if (plan.newName && plan.newName !== guild.name) {
      try {
        await guild.setName(plan.newName, 'Renomeado via /criar');
        renamed = true;
      } catch (err) {
        failures.push(`Não foi possível renomear o servidor: ${(err as Error).message}`);
      }
    }

    // 2. Criar cargos (staff primeiro, depois temáticos), do menor pro maior nível de importância
    const roleMap = new Map<string, Role>();
    for (const roleBlueprint of plan.roles) {
      const existing = guild.roles.cache.find((r) => r.name === roleBlueprint.name);
      if (existing) {
        skippedRoles.push(roleBlueprint.name);
        roleMap.set(roleBlueprint.name, existing);
        continue;
      }

      try {
        const role = await guild.roles.create({
          name: roleBlueprint.name,
          color: roleBlueprint.color,
          hoist: roleBlueprint.hoist,
          mentionable: roleBlueprint.mentionable,
          reason: 'Criado via /criar',
        });
        roleMap.set(roleBlueprint.name, role);
        createdRoles.push(roleBlueprint.name);
        createdRoleIds.push(role.id);
      } catch (err) {
        failures.push(`Falha ao criar cargo "${roleBlueprint.name}": ${(err as Error).message}`);
      }
    }

    const staffRoleIds = plan.roles.filter((r) => r.isStaff).map((r) => roleMap.get(r.name)?.id).filter(Boolean) as string[];

    // 3. Criar categorias e canais
    for (const category of plan.categories) {
      const existingCategory = guild.channels.cache.find((c) => c.name === category.name && c.type === ChannelType.GuildCategory);

      const overwrites: OverwriteResolvable[] = category.staffOnly
        ? [
            { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
            ...staffRoleIds.map((id) => ({ id, allow: [PermissionFlagsBits.ViewChannel] })),
          ]
        : [];

      let categoryChannel = existingCategory;
      if (!categoryChannel) {
        try {
          categoryChannel = await guild.channels.create({
            name: category.name,
            type: ChannelType.GuildCategory,
            permissionOverwrites: overwrites,
            reason: 'Criado via /criar',
          });
          createdChannelIds.push(categoryChannel.id);
        } catch (err) {
          failures.push(`Falha ao criar categoria "${category.name}": ${(err as Error).message}`);
          continue;
        }
      }

      for (const channelBlueprint of category.channels) {
        const existingChannel = guild.channels.cache.find(
          (c) => c.name === channelBlueprint.name.toLowerCase().replace(/\s+/g, '-') && c.parentId === categoryChannel!.id
        );

        if (existingChannel) {
          skippedChannels.push(channelBlueprint.name);
          continue;
        }

        try {
          const channel = await guild.channels.create({
            name: channelBlueprint.name,
            type: channelBlueprint.type,
            parent: categoryChannel.id,
            topic: 'topic' in channelBlueprint ? channelBlueprint.topic : undefined,
            reason: 'Criado via /criar',
          });
          createdChannels.push(channelBlueprint.name);
          createdChannelIds.push(channel.id);

          // 4. Postar regras automaticamente no canal "regras"
          if (channelBlueprint.name === 'regras' && channel.type === ChannelType.GuildText) {
            await channel.send(plan.rulesText).catch(() => undefined);
          }
        } catch (err) {
          failures.push(`Falha ao criar canal "${channelBlueprint.name}": ${(err as Error).message}`);
        }
      }
    }

    const record: ServerCreationRecord = {
      id: `${guild.id}-${Date.now()}`,
      guildId: guild.id,
      createdAt: Date.now(),
      createdRoleIds,
      createdChannelIds,
      renamedFrom: renamed ? renamedFrom : null,
    };

    const all = readJson<ServerCreationRecord[]>(FILE, []);
    all.push(record);
    await writeJson(FILE, all);

    logger.info(
      'serverCreationService',
      `Servidor ${guild.id}: ${createdRoles.length} cargo(s), ${createdChannels.length} canal(is) criado(s), ${failures.length} falha(s).`
    );

    return { record, createdRoles, skippedRoles, createdChannels, skippedChannels, failures, renamed };
  },

  /**
   * Desfaz a última criação: apaga apenas o que foi criado por esse registro específico
   * (nunca apaga algo que já existia antes). Usado por /servidor-rollback.
   */
  async rollback(guild: Guild, recordId: string): Promise<{ removedRoles: number; removedChannels: number }> {
    const all = readJson<ServerCreationRecord[]>(FILE, []);
    const record = all.find((r) => r.id === recordId);
    if (!record) throw new Error('Registro de criação não encontrado.');

    let removedRoles = 0;
    let removedChannels = 0;

    for (const channelId of record.createdChannelIds) {
      const channel = guild.channels.cache.get(channelId);
      if (channel) {
        try {
          await channel.delete('Rollback de /criar');
          removedChannels++;
        } catch {
          // ignora falhas individuais, segue tentando os outros
        }
      }
    }

    for (const roleId of record.createdRoleIds) {
      const role = guild.roles.cache.get(roleId);
      if (role) {
        try {
          await role.delete('Rollback de /criar');
          removedRoles++;
        } catch {
          // ignora falhas individuais
        }
      }
    }

    const remaining = all.filter((r) => r.id !== recordId);
    await writeJson(FILE, remaining);

    return { removedRoles, removedChannels };
  },

  getHistory(guildId: string): ServerCreationRecord[] {
    return readJson<ServerCreationRecord[]>(FILE, []).filter((r) => r.guildId === guildId);
  },
};
