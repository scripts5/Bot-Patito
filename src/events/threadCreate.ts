import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'threadCreate'> = {
  name: 'threadCreate',
  async execute(thread) {
    logger.info('threadCreate', `Tópico criado: ${thread.name} (${thread.id})`);
  },
};

export default event;
