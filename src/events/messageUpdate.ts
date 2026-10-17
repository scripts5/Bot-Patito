import { BotEvent } from '../handlers/eventHandler.js';
import { automodService } from '../services/automodService.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'messageUpdate'> = {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    if (newMessage.author?.bot || !newMessage.guild) return;
    if (oldMessage.content === newMessage.content) return;

    logger.messageLog(
      `edit guild=${newMessage.guild.id} channel=${newMessage.channelId} author=${newMessage.author?.id} old="${oldMessage.content ?? ''}" new="${newMessage.content ?? ''}"`
    );

    if (newMessage.content && 'guild' in newMessage && newMessage.guild) {
      const fullMessage = newMessage.partial ? await newMessage.fetch() : newMessage;
      const violation = await automodService.check(fullMessage);
      if (violation) await automodService.enforce(fullMessage, violation);
    }
  },
};

export default event;
