import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildMemberUpdate'> = {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    if (oldMember.nickname !== newMember.nickname) {
      logger.member(`nickname_change guild=${newMember.guild.id} user=${newMember.id} old="${oldMember.nickname}" new="${newMember.nickname}"`);
    }
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      logger.member(`roles_change guild=${newMember.guild.id} user=${newMember.id}`);
    }
  },
};

export default event;
