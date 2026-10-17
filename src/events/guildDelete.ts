import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildDelete'> = {
  name: 'guildDelete',
  async execute(guild) {
    logger.info('guildDelete', `Bot removido do servidor "${guild.name}" (${guild.id}).`);
  },
};

export default event;
