import { BotEvent } from '../handlers/eventHandler.js';
import { automodService } from '../services/automodService.js';
import { levelService } from '../services/levelService.js';
import { logger } from '../utils/logger.js';

const event: BotEvent<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot || !message.guild) return;

    const violation = await automodService.check(message);
    if (violation) {
      await automodService.enforce(message, violation);
      return;
    }

    const result = await levelService.handleMessage(message.guild.id, message.author.id);
    if (result?.leveledUp) {
      try {
        await message.channel.send(`🎉 ${message.author} subiu para o nível **${result.newLevel}**!`);
      } catch (err) {
        logger.error('messageCreate', `Falha ao anunciar level up: ${err}`);
      }
    }
  },
};

export default event;
