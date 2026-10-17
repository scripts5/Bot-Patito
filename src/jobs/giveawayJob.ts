import { Client } from 'discord.js';
import { giveawayRepository } from '../database/repositories/giveawayRepository.js';
import { giveawayService } from '../services/giveawayService.js';
import { logger } from '../utils/logger.js';

/**
 * Roda a cada 30 segundos: encerra sorteios cujo prazo já passou.
 */
export function startGiveawayJob(client: Client): void {
  setInterval(async () => {
    const active = giveawayRepository.listActive().filter((g) => g.endsAt <= Date.now() && !g.paused);

    for (const giveaway of active) {
      const guild = client.guilds.cache.get(giveaway.guildId);
      if (!guild) continue;

      try {
        await giveawayService.end(guild, giveaway.id);
      } catch (err) {
        logger.error('giveawayJob', `Falha ao encerrar sorteio ${giveaway.id}: ${err}`);
      }
    }
  }, 30_000);
}
