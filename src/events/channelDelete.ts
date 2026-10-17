import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'channelDelete'> = {
  name: 'channelDelete',
  async execute(channel) {
    if ('guild' in channel) {
      logger.info('channelDelete', `Canal apagado: ${channel.name} (${channel.id}) em ${channel.guild.id}`);
    }
  },
};

export default event;
