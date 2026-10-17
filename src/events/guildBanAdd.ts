import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildBanAdd'> = {
  name: 'guildBanAdd',
  async execute(ban) {
    logger.moderation(`native_ban guild=${ban.guild.id} user=${ban.user.id}`);
  },
};

export default event;
