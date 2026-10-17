import { BotEvent } from '../handlers/eventHandler.js';
import { welcomeService } from '../services/welcomeService.js';
import { roleService } from '../services/roleService.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'guildMemberAdd'> = {
  name: 'guildMemberAdd',
  async execute(member) {
    logger.member(`join guild=${member.guild.id} user=${member.id}`);
    await welcomeService.sendWelcome(member);
    await roleService.applyAutorole(member);
  },
};

export default event;
