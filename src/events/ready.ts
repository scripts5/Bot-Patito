import { ActivityType } from 'discord.js';
import { BotEvent } from '../handlers/eventHandler.js';
import { PatitoClient } from '../types/command.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';
import { autoConfigService } from '../services/autoConfigService.js';

const event: BotEvent<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client) {
    const c = client as PatitoClient;
    logger.success('ready', `${config.BOT_NAME} online como ${c.user?.tag}.`);
    logger.info('ready', `Servindo ${c.guilds.cache.size} servidor(es), ${c.commands.size} comando(s) carregado(s).`);

    c.user?.setPresence({
      activities: [{ name: `/ajuda | ${config.BOT_NAME}`, type: ActivityType.Watching }],
      status: 'online',
    });

    // Auto-configuração: roda em todo servidor que ainda não foi analisado
    // (settings.autoConfigured = false). Não repete em servidores já configurados.
    for (const guild of c.guilds.cache.values()) {
      autoConfigService.run(guild).catch((err) => {
        logger.error('ready', `Falha na auto-configuração de ${guild.id}: ${err}`);
      });
    }
  },
};

export default event;
