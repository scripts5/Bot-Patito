import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'threadDelete'> = {
  name: 'threadDelete',
  async execute(thread) {
    logger.info('threadDelete', `Tópico apagado: ${thread.name} (${thread.id})`);
  },
};

export default event;
