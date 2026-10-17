import { BotEvent } from '../handlers/eventHandler.js';
import { goodbyeService } from '../services/goodbyeService.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildMemberRemove'> = {
  name: 'guildMemberRemove',
  async execute(member) {
    logger.member(`leave guild=${member.guild.id} user=${member.id}`);
    await goodbyeService.sendGoodbye(member);
  },
};

export default event;
