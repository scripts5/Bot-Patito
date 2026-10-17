import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { levelService } from '../../services/levelService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('showcase').setDescription('Mostra um resumo vistoso das suas conquistas.') as SlashCommandBuilder,
  category: 'profile',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const profile = userRepository.get(interaction.user.id);
    const level = levelService.getProfile(interaction.guild!.id, interaction.user.id);

    const embed = new EmbedBuilder()
      .setColor(colors.gold)
      .setTitle(`✨ Showcase de ${interaction.user.username}`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setDescription(
        `🏅 Nível **${level.level}** (Prestígio ${level.prestige})\n⭐ Reputação: **${profile.reputation}**\n🎖️ Emblemas: ${profile.badges.length > 0 ? profile.badges.join(' ') : 'Nenhum'}`
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
