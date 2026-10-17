import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'roleUpdate'> = {
  name: 'roleUpdate',
  async execute(oldRole, newRole) {
    if (oldRole.name !== newRole.name) {
      logger.info('roleUpdate', `Cargo renomeado: "${oldRole.name}" -> "${newRole.name}" (${newRole.id})`);
    }
  },
};

export default event;
