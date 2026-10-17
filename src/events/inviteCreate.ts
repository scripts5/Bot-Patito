import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'inviteCreate'> = {
  name: 'inviteCreate',
  async execute(invite) {
    logger.info('inviteCreate', `Convite criado: ${invite.code} por ${invite.inviter?.tag ?? 'desconhecido'} em ${invite.guild?.id}`);
  },
};

export default event;
