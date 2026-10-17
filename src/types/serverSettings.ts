export interface DetectedBot {
  id: string;
  name: string;
  features: string[];
}

export interface ServerSettings {
  guildId: string;
  prefix: string;
  language: string;
  theme: string | null;
  themeConfidence: number;
  modLogChannelId: string | null;
  welcomeChannelId: string | null;
  goodbyeChannelId: string | null;
  ticketCategoryId: string | null;
  ticketSupportRoleId: string | null;
  autoroleId: string | null;
  antiRaid: boolean;
  automod: {
    antiSpam: boolean;
    antiLinks: boolean;
    antiInvites: boolean;
    antiCaps: boolean;
    bannedWords: string[];
  };
  // Preenchidos automaticamente ao entrar no servidor (ou no primeiro "ready" após a atualização).
  autoConfigured: boolean;
  // true depois que a proposta de configuração foi enviada ao dono (evita reenviar a cada boot).
  autoConfigProposed: boolean;
  detectedBots: DetectedBot[];
  // Liga/desliga funções automáticas do Patito conforme outro bot já cobre aquilo
  // (evita boas-vindas duplicadas, XP duplicado, moderação conflitante, etc).
  features: {
    welcome: boolean;
    goodbye: boolean;
    leveling: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
