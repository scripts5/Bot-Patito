import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('richest').setDescription('Mostra quem é o membro mais rico do servidor.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const [top] = economyService.leaderboard(interaction.guild!.id, 1);
    if (!top) {
      await interaction.reply({ embeds: [errorEmbed('Ninguém tem saldo registrado ainda.')] });
      return;
    }
    await interaction.reply({ embeds: [successEmbed(`<@${top.userId}> é o mais rico com ${formatCurrency(top.balance + top.bank)}!`, '👑 Mais Rico')] });
  },
};

export default command;
