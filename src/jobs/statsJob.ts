import { Client, ActivityType } from 'discord.js';
import { config } from '../config.js';

/**
 * Roda a cada 5 minutos: atualiza o status/atividade do bot com estatísticas atuais.
 */
export function startStatsJob(client: Client): void {
  setInterval(() => {
    const guildCount = client.guilds.cache.size;
    const memberCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

    client.user?.setPresence({
      activities: [{ name: `${memberCount} membros | ${config.BOT_NAME}`, type: ActivityType.Watching }],
      status: 'online',
    });
  }, 5 * 60_000);
}
