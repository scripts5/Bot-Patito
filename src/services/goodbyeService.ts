import { EmbedBuilder, GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { serverConfigService } from './serverConfigService.js';
import { colors } from '../config/colors.js';
import { logger } from '../utils/logger.js';

export const goodbyeService = {
  async sendGoodbye(member: GuildMember | PartialGuildMember): Promise<void> {
    const settings = serverConfigService.getSettings(member.guild.id);
    if (!settings.goodbyeChannelId || !settings.features.goodbye) return;

    const channel = member.guild.channels.cache.get(settings.goodbyeChannelId) as TextChannel | undefined;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(colors.error)
      .setDescription(`**${member.user?.tag ?? 'Um membro'}** saiu do servidor. Agora somos **${member.guild.memberCount}** membros.`)
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error('goodbyeService', `Falha ao enviar despedida em ${member.guild.id}: ${err}`);
    }
  },
};
