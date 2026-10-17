import { ChannelType, Guild } from 'discord.js';
import { detectThemeFromText } from '../config/themeDetection.js';
import { matchKnownBot } from '../config/knownBots.js';
import { DetectedBot, ServerSettings } from '../types/serverSettings.js';
import { logger } from '../utils/logger.js';

export interface ChannelMatch {
  setting: keyof ServerSettings;
  label: string;
  channelId: string;
  channelName: string;
}

export interface AutoConfigPlan {
  detectedTheme: string;
  confidence: number;
  settingsPatch: Partial<ServerSettings>;
  matches: ChannelMatch[];
  unmatched: string[];
}

// Padrões de nome (regex) usados para reconhecer a função de cada canal já existente.
// Case-insensitive; discord.js já normaliza nomes de canal para minúsculas com hífen.
const CHANNEL_PATTERNS: { setting: keyof ServerSettings; label: string; patterns: RegExp[] }[] = [
  { setting: 'modLogChannelId', label: 'Canal de logs de moderação', patterns: [/mod.?log/i, /log.?mod/i, /registro.?de.?a[cç][oõ]es/i, /logs?-moderac/i] },
  { setting: 'welcomeChannelId', label: 'Canal de boas-vindas', patterns: [/bem.?vindo/i, /boas.?vindas/i, /^welcome$/i, /entrada/i] },
  { setting: 'goodbyeChannelId', label: 'Canal de despedida', patterns: [/despedida/i, /^goodbye$/i, /sa[ií]da/i, /adeus/i] },
];

const TICKET_CATEGORY_PATTERNS = [/ticket/i, /suporte/i, /atendimento/i];
const STAFF_ROLE_PATTERNS = [/staff/i, /moderador/i, /admin/i, /suporte/i, /atendente/i];

export const serverScanService = {
  /**
   * Monta um plano de auto-configuração lendo os canais e cargos já existentes no servidor.
   * Não altera nada — só sugere/calcula. A aplicação é feita separadamente.
   */
  buildPlan(guild: Guild): AutoConfigPlan {
    const matches: ChannelMatch[] = [];
    const settingsPatch: Partial<ServerSettings> = {};
    const unmatched: string[] = [];

    const textChannels = guild.channels.cache.filter((c) => c.type === ChannelType.GuildText);
    const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory);

    for (const { setting, label, patterns } of CHANNEL_PATTERNS) {
      const found = textChannels.find((c) => patterns.some((p) => p.test(c.name)));
      if (found) {
        matches.push({ setting, label, channelId: found.id, channelName: found.name });
        (settingsPatch as Record<string, unknown>)[setting] = found.id;
      } else {
        unmatched.push(label);
      }
    }

    const ticketCategory = categories.find((c) => TICKET_CATEGORY_PATTERNS.some((p) => p.test(c.name)));
    if (ticketCategory) {
      matches.push({ setting: 'ticketCategoryId', label: 'Categoria de tickets', channelId: ticketCategory.id, channelName: ticketCategory.name });
      settingsPatch.ticketCategoryId = ticketCategory.id;
    } else {
      unmatched.push('Categoria de tickets');
    }

    const staffRole = guild.roles.cache.find((r) => STAFF_ROLE_PATTERNS.some((p) => p.test(r.name)) && !r.managed);
    if (staffRole) {
      matches.push({ setting: 'ticketSupportRoleId', label: 'Cargo de suporte/staff', channelId: staffRole.id, channelName: staffRole.name });
      settingsPatch.ticketSupportRoleId = staffRole.id;
    } else {
      unmatched.push('Cargo de suporte/staff');
    }

    // Detecção de tema: combina nomes de todos os canais e cargos do servidor.
    const combinedText = [
      ...guild.channels.cache.map((c) => c.name),
      ...guild.roles.cache.map((r) => r.name),
      guild.name,
    ].join(' ');

    const { theme, confidence } = detectThemeFromText(combinedText);
    settingsPatch.theme = theme;
    settingsPatch.themeConfidence = confidence;

    return { detectedTheme: theme, confidence, settingsPatch, matches, unmatched };
  },

  /**
   * Lista os outros bots presentes no servidor e, para os conhecidos, quais funções cobrem.
   * Bots não reconhecidos entram na lista mas não desligam nenhuma função do Patito.
   */
  async detectBots(guild: Guild): Promise<DetectedBot[]> {
    try {
      const members = await guild.members.fetch();
      return members
        .filter((m) => m.user.bot && m.id !== guild.client.user?.id)
        .map((m) => ({ id: m.id, name: m.user.username, features: matchKnownBot(m.user.username) }));
    } catch (err) {
      logger.error('serverScanService', `Falha ao buscar membros para detectar bots em ${guild.id}: ${err}`);
      return [];
    }
  },

  /**
   * Plano completo: canais/cargos existentes + tema detectado + outros bots presentes.
   * Desliga automaticamente a função correspondente do Patito (boas-vindas, despedida, XP)
   * quando outro bot conhecido já cobre aquilo, para não duplicar.
   */
  async buildFullPlan(guild: Guild): Promise<AutoConfigPlan & { detectedBots: DetectedBot[] }> {
    const base = this.buildPlan(guild);
    const detectedBots = await this.detectBots(guild);
    const coveredFeatures = new Set(detectedBots.flatMap((b) => b.features));

    const patch: Partial<ServerSettings> = {
      ...base.settingsPatch,
      detectedBots,
      autoConfigured: true,
      features: {
        welcome: !coveredFeatures.has('welcome'),
        goodbye: !coveredFeatures.has('welcome'),
        leveling: !coveredFeatures.has('leveling'),
      },
    };

    // Se nenhum bot de moderação/automod foi encontrado, o Patito assume essa função sozinho
    // ativando um conjunto seguro de regras de automod por padrão.
    if (!coveredFeatures.has('automod') && !coveredFeatures.has('moderation')) {
      patch.automod = {
        antiSpam: true,
        antiLinks: false,
        antiInvites: true,
        antiCaps: false,
        bannedWords: [],
      };
    }

    return { ...base, settingsPatch: patch, detectedBots };
  },
};
