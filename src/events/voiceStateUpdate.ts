import { BotEvent } from '../handlers/eventHandler.js';
import { logger } from '../utils/logger.js';
import { playerService } from '../services/playerService.js';
import { musicService } from '../services/musicService.js';

const event: BotEvent<'voiceStateUpdate'> = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const guildId = newState.guild.id;

    if (oldState.channelId && !newState.channelId) {
      logger.voice(`leave guild=${guildId} user=${newState.id} channel=${oldState.channelId}`);
    } else if (!oldState.channelId && newState.channelId) {
      logger.voice(`join guild=${guildId} user=${newState.id} channel=${newState.channelId}`);
    } else if (oldState.channelId !== newState.channelId) {
      logger.voice(`move guild=${guildId} user=${newState.id} from=${oldState.channelId} to=${newState.channelId}`);
    }

    // Se o bot ficou sozinho no canal de voz, sai automaticamente após checar.
    if (playerService.has(guildId)) {
      const channel = newState.guild.members.me?.voice.channel;
      if (channel && channel.members.filter((m) => !m.user.bot).size === 0) {
        musicService.leave(guildId);
        logger.info('voiceStateUpdate', `Saí do canal de voz em ${guildId} por estar sozinho.`);
      }
    }
  },
};

export default event;
