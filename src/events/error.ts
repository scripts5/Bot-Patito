import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'error'> = {
  name: 'error',
  async execute(error) {
    logger.error('client', `Erro no client do Discord: ${error.message}`);
  },
};

export default event;
