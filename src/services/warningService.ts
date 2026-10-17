import { warningRepository } from '../database/repositories/warningRepository.js';
import { caseService } from './caseService.js';

export const warningService = {
  async warn(guildId: string, userId: string, moderatorId: string, reason: string) {
    const warning = await warningRepository.add({ guildId, userId, moderatorId, reason });
    const moderationCase = await caseService.createCase(guildId, 'warn', userId, moderatorId, reason);
    return { warning, case: moderationCase };
  },
  list(guildId: string, userId: string) {
    return warningRepository.listByUser(guildId, userId);
  },
  async unwarn(guildId: string, warningId: string, moderatorId: string) {
    const removed = await warningRepository.remove(warningId);
    if (removed) {
      await caseService.createCase(guildId, 'unwarn', warningId, moderatorId, 'Advertência removida');
    }
    return removed;
  },
};
