import { guildRepository } from '../database/repositories/guildRepository.js';
import { ServerSettings } from '../types/serverSettings.js';
import { cacheService } from './cacheService.js';

function cacheKey(guildId: string): string {
  return `settings:${guildId}`;
}

export const serverConfigService = {
  getSettings(guildId: string): ServerSettings {
    const cached = cacheService.get<ServerSettings>(cacheKey(guildId));
    if (cached) return cached;
    const settings = guildRepository.getSettings(guildId);
    cacheService.set(cacheKey(guildId), settings, 5 * 60_000);
    return settings;
  },
  async update(guildId: string, patch: Partial<ServerSettings>): Promise<ServerSettings> {
    const updated = await guildRepository.updateSettings(guildId, patch);
    cacheService.set(cacheKey(guildId), updated, 5 * 60_000);
    return updated;
  },
  async reset(guildId: string): Promise<ServerSettings> {
    const reset = await guildRepository.resetSettings(guildId);
    cacheService.delete(cacheKey(guildId));
    return reset;
  },
};
