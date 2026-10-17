import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { formatDate } from '../../utils/dateUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('serverinfo').setDescription('Mostra informações do servidor.') as SlashCommandBuilder,
  category: 'utility',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL() ?? null)
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Dono', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Criado em', value: formatDate(guild.createdAt), inline: true },
        { name: 'Membros', value: `${guild.memberCount}`, inline: true },
        { name: 'Cargos', value: `${guild.roles.cache.size}`, inline: true },
        { name: 'Canais', value: `${guild.channels.cache.size}`, inline: true },
        { name: 'Nível de boost', value: `${guild.premiumTier}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount ?? 0}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
