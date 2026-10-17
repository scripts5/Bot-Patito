import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { colors } from '../../config/colors.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('leaderboard').setDescription('Mostra o ranking de mais ricos do servidor.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const top = economyService.leaderboard(interaction.guild!.id, 10);

    if (top.length === 0) {
      await interaction.reply('Ninguém tem saldo registrado ainda nesse servidor.');
      return;
    }

    const description = top
      .map((acc, i) => `**${i + 1}.** <@${acc.userId}> — ${formatCurrency(acc.balance + acc.bank)}`)
      .join('\n');

    const embed = new EmbedBuilder().setColor(colors.gold).setTitle('🏆 Ranking de Riqueza').setDescription(description);
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
