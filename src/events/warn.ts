import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'warn'> = {
  name: 'warn',
  async execute(message) {
    logger.warn('client', message);
  },
};

export default event;
