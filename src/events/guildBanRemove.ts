import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildBanRemove'> = {
  name: 'guildBanRemove',
  async execute(ban) {
    logger.moderation(`native_unban guild=${ban.guild.id} user=${ban.user.id}`);
  },
};

export default event;
