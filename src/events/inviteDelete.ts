import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'inviteDelete'> = {
  name: 'inviteDelete',
  async execute(invite) {
    logger.info('inviteDelete', `Convite removido: ${invite.code} em ${invite.guild?.id}`);
  },
};

export default event;
