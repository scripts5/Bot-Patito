import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { colors } from '../../config/colors.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Mostra seu saldo (ou de outro usuário).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário (padrão: você)')) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const account = economyService.getBalance(interaction.guild!.id, user.id);

    const embed = new EmbedBuilder()
      .setColor(colors.gold)
      .setTitle(`Carteira de ${user.username}`)
      .addFields(
        { name: 'Carteira', value: formatCurrency(account.balance), inline: true },
        { name: 'Banco', value: formatCurrency(account.bank), inline: true },
        { name: 'Total', value: formatCurrency(account.balance + account.bank), inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
