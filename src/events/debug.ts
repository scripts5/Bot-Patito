import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'debug'> = {
  name: 'debug',
  async execute(message) {
    logger.debug('client', message);
  },
};

export default event;
