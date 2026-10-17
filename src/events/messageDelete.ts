import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'messageDelete'> = {
  name: 'messageDelete',
  async execute(message) {
    if (message.author?.bot) return;
    logger.messageLog(`delete guild=${message.guild?.id} channel=${message.channelId} author=${message.author?.id} content="${message.content ?? ''}"`);
  },
};

export default event;
