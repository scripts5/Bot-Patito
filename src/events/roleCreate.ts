import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'roleCreate'> = {
  name: 'roleCreate',
  async execute(role) {
    logger.info('roleCreate', `Cargo criado: ${role.name} (${role.id}) em ${role.guild.id}`);
  },
};

export default event;
