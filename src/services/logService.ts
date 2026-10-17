import { EmbedBuilder, Guild, TextChannel } from 'discord.js';
import { serverConfigService } from './serverConfigService.js';
import { colors } from '../config/colors.js';
import { logger } from '../utils/logger.js';

export const logService = {
  async sendToModLog(guild: Guild, embed: EmbedBuilder): Promise<void> {
    const settings = serverConfigService.getSettings(guild.id);
    if (!settings.modLogChannelId) return;

    const channel = guild.channels.cache.get(settings.modLogChannelId) as TextChannel | undefined;
    if (!channel) return;

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error('logService', `Falha ao enviar log de moderação em ${guild.id}: ${err}`);
    }
  },
  buildCaseEmbed(caseId: number, type: string, targetTag: string, moderatorTag: string, reason: string): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(colors.neutral)
      .setTitle(`Caso #${caseId} — ${type}`)
      .addFields(
        { name: 'Alvo', value: targetTag, inline: true },
        { name: 'Moderador', value: moderatorTag, inline: true },
        { name: 'Motivo', value: reason || 'Nenhum motivo informado' }
      )
      .setTimestamp();
  },
};
