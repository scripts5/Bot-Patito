import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'roleDelete'> = {
  name: 'roleDelete',
  async execute(role) {
    logger.info('roleDelete', `Cargo apagado: ${role.name} (${role.id}) em ${role.guild.id}`);
  },
};

export default event;
