import { caseRepository } from '../database/repositories/caseRepository.js';
import { CaseType } from '../types/case.js';
import { logger } from '../utils/logger.js';

export const caseService = {
  async createCase(guildId: string, type: CaseType, targetId: string, moderatorId: string, reason: string) {
    const created = await caseRepository.create(guildId, type, targetId, moderatorId, reason);
    logger.moderation(
      `guild=${guildId} case=${created.caseId} type=${type} target=${targetId} moderator=${moderatorId} reason="${reason}"`
    );
    return created;
  },
  listByGuild(guildId: string) {
    return caseRepository.listByGuild(guildId);
  },
  getCase(guildId: string, caseId: number) {
    return caseRepository.getByCaseId(guildId, caseId);
  },
};
