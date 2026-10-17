import { readJson, writeJson } from '../jsonDatabase.js';
import { ServerSettings } from '../../types/serverSettings.js';

const FILE = 'settings';

function defaults(guildId: string): ServerSettings {
  return {
    guildId,
    prefix: '/',
    language: 'pt-BR',
    theme: null,
    themeConfidence: 0,
    modLogChannelId: null,
    welcomeChannelId: null,
    goodbyeChannelId: null,
    ticketCategoryId: null,
    ticketSupportRoleId: null,
    autoroleId: null,
    antiRaid: false,
    automod: {
      antiSpam: false,
      antiLinks: false,
      antiInvites: false,
      antiCaps: false,
      bannedWords: [],
    },
    autoConfigured: false,
    autoConfigProposed: false,
    detectedBots: [],
    features: {
      welcome: true,
      goodbye: true,
      leveling: true,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function readAll(): Record<string, ServerSettings> {
  return readJson<Record<string, ServerSettings>>(FILE, {});
}

export const guildRepository = {
  getSettings(guildId: string): ServerSettings {
    const all = readAll();
    return all[guildId] ?? defaults(guildId);
  },
  async updateSettings(guildId: string, patch: Partial<ServerSettings>): Promise<ServerSettings> {
    const all = readAll();
    const current = all[guildId] ?? defaults(guildId);
    const updated: ServerSettings = { ...current, ...patch, updatedAt: Date.now() };
    all[guildId] = updated;
    await writeJson(FILE, all);
    return updated;
  },
  async resetSettings(guildId: string): Promise<ServerSettings> {
    const all = readAll();
    all[guildId] = defaults(guildId);
    await writeJson(FILE, all);
    return all[guildId];
  },
};
