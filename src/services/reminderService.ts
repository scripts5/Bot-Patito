import { reminderRepository } from '../database/repositories/reminderRepository.js';

export const reminderService = {
  async create(userId: string, guildId: string | null, channelId: string, message: string, remindAt: number) {
    return reminderRepository.create({ userId, guildId, channelId, message, remindAt });
  },
  listPending() {
    return reminderRepository.listPending();
  },
  listByUser(userId: string) {
    return reminderRepository.listByUser(userId);
  },
  async remove(id: string, userId: string) {
    return reminderRepository.remove(id, userId);
  },
  async clearAll(userId: string) {
    return reminderRepository.clearForUser(userId);
  },
  async markSent(id: string) {
    return reminderRepository.markSent(id);
  },
};
