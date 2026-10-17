import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'messageDeleteBulk'> = {
  name: 'messageDeleteBulk',
  async execute(messages) {
    const first = messages.first();
    logger.messageLog(`bulk_delete guild=${first?.guild?.id} channel=${first?.channelId} count=${messages.size}`);
  },
};

export default event;
