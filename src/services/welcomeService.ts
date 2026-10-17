import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js';
import { serverConfigService } from './serverConfigService.js';
import { colors } from '../config/colors.js';
import { logger } from '../utils/logger.js';

export const welcomeService = {
  async sendWelcome(member: GuildMember): Promise<void> {
    const settings = serverConfigService.getSettings(member.guild.id);
    if (!settings.welcomeChannelId || !settings.features.welcome) return;

    const channel = member.guild.channels.cache.get(settings.welcomeChannelId) as TextChannel | undefined;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('Novo membro!')
      .setDescription(`Bem-vindo(a), ${member}! Agora somos **${member.guild.memberCount}** membros.`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    try {
      await channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error('welcomeService', `Falha ao enviar boas-vindas em ${member.guild.id}: ${err}`);
    }
  },
};
