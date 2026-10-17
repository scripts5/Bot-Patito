import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('toplevel').setDescription('Mostra quem tem o maior nível no servidor.') as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const [top] = levelService.leaderboard(interaction.guild!.id, 1);
    if (!top) {
      await interaction.reply({ embeds: [errorEmbed('Ninguém tem XP registrado ainda.')] });
      return;
    }
    await interaction.reply({ embeds: [successEmbed(`<@${top.userId}> lidera com nível **${top.level}**!`, '🏆 Top Nível')] });
  },
};

export default command;
