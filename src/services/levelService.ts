import { levelRepository, xpForLevel } from '../database/repositories/levelRepository.js';
import { botConfig } from '../config/botConfig.js';
import { randomInt } from '../utils/mathUtils.js';
import { serverConfigService } from './serverConfigService.js';

export const levelService = {
  getProfile(guildId: string, userId: string) {
    const account = levelRepository.get(guildId, userId);
    return { ...account, xpNeeded: xpForLevel(account.level) };
  },

  leaderboard(guildId: string, limit = 10) {
    return levelRepository.leaderboard(guildId, limit);
  },

  async handleMessage(guildId: string, userId: string): Promise<{ leveledUp: boolean; newLevel?: number } | null> {
    if (!serverConfigService.getSettings(guildId).features.leveling) return null;

    const account = levelRepository.get(guildId, userId);
    const now = Date.now();

    if (account.lastMessageAt && now - account.lastMessageAt < botConfig.levels.messageCooldownMs) {
      return null;
    }

    const amount = randomInt(botConfig.levels.xpPerMessageMin, botConfig.levels.xpPerMessageMax);
    const { account: updated, leveledUp } = await levelRepository.addXp(guildId, userId, amount);

    return leveledUp ? { leveledUp: true, newLevel: updated.level } : { leveledUp: false };
  },

  async reset(guildId: string, userId: string) {
    return levelRepository.reset(guildId, userId);
  },
};
