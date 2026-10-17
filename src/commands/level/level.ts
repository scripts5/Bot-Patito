import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('level').setDescription('Mostra rapidamente seu nível atual.') as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const profile = levelService.getProfile(interaction.guild!.id, interaction.user.id);
    await interaction.reply({ embeds: [successEmbed(`Você está no nível **${profile.level}** (${profile.xp}/${profile.xpNeeded} XP).`)] });
  },
};

export default command;
