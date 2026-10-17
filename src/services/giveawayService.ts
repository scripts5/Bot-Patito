import { EmbedBuilder, Guild, TextChannel } from 'discord.js';
import { giveawayRepository } from '../database/repositories/giveawayRepository.js';
import { colors } from '../config/colors.js';
import { randomItem } from '../utils/arrayUtils.js';
import { formatTimestamp } from '../utils/timeUtils.js';
import { logger } from '../utils/logger.js';

export const giveawayService = {
  buildEmbed(prize: string, winnersCount: number, endsAt: number, hostTag: string, participants: number) {
    return new EmbedBuilder()
      .setColor(colors.gold)
      .setTitle(`🎁 SORTEIO: ${prize}`)
      .setDescription(
        `Reaja com 🎉 para participar!\nGanhadores: **${winnersCount}**\nTermina: ${formatTimestamp(endsAt)}\nHost: ${hostTag}\nParticipantes: **${participants}**`
      )
      .setTimestamp(endsAt);
  },

  async end(guild: Guild, giveawayId: string): Promise<{ winners: string[] } | null> {
    const giveaway = giveawayRepository.getById(giveawayId);
    if (!giveaway || giveaway.ended) return null;

    const pool = [...giveaway.participants];
    const winners: string[] = [];

    for (let i = 0; i < giveaway.winnersCount && pool.length > 0; i++) {
      const winner = randomItem(pool);
      winners.push(winner);
      pool.splice(pool.indexOf(winner), 1);
    }

    await giveawayRepository.update(giveawayId, { ended: true, winners });

    const channel = guild.channels.cache.get(giveaway.channelId) as TextChannel | undefined;
    if (channel) {
      const text =
        winners.length > 0
          ? `🎉 Parabéns ${winners.map((w) => `<@${w}>`).join(', ')}! Você(s) ganhou(ram) **${giveaway.prize}**!`
          : `Sorteio de **${giveaway.prize}** encerrado sem participantes.`;
      try {
        await channel.send(text);
      } catch (err) {
        logger.error('giveawayService', `Falha ao anunciar vencedores: ${err}`);
      }
    }

    return { winners };
  },
};
