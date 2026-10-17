import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'threadUpdate'> = {
  name: 'threadUpdate',
  async execute(oldThread, newThread) {
    if (oldThread.name !== newThread.name) {
      logger.info('threadUpdate', `Tópico renomeado: "${oldThread.name}" -> "${newThread.name}"`);
    }
    if (oldThread.archived !== newThread.archived) {
      logger.info('threadUpdate', `Tópico ${newThread.name} ${newThread.archived ? 'arquivado' : 'reaberto'}.`);
    }
  },
};

export default event;
