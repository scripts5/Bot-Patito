import { BotEvent } from '../handlers/eventHandler.js';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { autoConfigService } from '../services/autoConfigService.js';

const event: BotEvent<'guildCreate'> = {
  name: 'guildCreate',
  async execute(guild) {
    logger.info('guildCreate', `Bot adicionado ao servidor "${guild.name}" (${guild.id}).`);

    if (guild.id !== config.GUILD_ID) {
      logger.warn(
        'guildCreate',
        `Servidor ${guild.id} não é o GUILD_ID configurado. Esse bot é privado e não deveria estar em outros servidores.`
      );
    }

    // Analisa o servidor sozinho, sem precisar de comando: canais, cargos e outros bots presentes.
    await autoConfigService.run(guild).catch((err) => {
      logger.error('guildCreate', `Falha na auto-configuração de ${guild.id}: ${err}`);
    });
  },
};

export default event;
