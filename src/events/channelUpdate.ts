import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'channelUpdate'> = {
  name: 'channelUpdate',
  async execute(oldChannel, newChannel) {
    if ('name' in oldChannel && 'name' in newChannel && oldChannel.name !== newChannel.name) {
      logger.info('channelUpdate', `Canal renomeado: "${oldChannel.name}" -> "${newChannel.name}" (${newChannel.id})`);
    }
  },
};

export default event;
