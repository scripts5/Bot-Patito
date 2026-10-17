import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'channelCreate'> = {
  name: 'channelCreate',
  async execute(channel) {
    if ('guild' in channel) {
      logger.info('channelCreate', `Canal criado: ${channel.name} (${channel.id}) em ${channel.guild.id}`);
    }
  },
};

export default event;
