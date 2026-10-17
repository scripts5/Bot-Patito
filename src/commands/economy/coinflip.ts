import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyRepository } from '../../database/repositories/economyRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Aposta na moeda: cara ou coroa.')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor a apostar').setRequired(true).setMinValue(1))
    .addStringOption((opt) =>
      opt.setName('lado').setDescription('Escolha').setRequired(true).addChoices({ name: 'Cara', value: 'cara' }, { name: 'Coroa', value: 'coroa' })
    ) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const choice = interaction.options.getString('lado', true);

    const account = economyRepository.get(interaction.guild!.id, interaction.user.id);
    if (amount > account.balance) {
      await interaction.reply({ embeds: [errorEmbed('Saldo insuficiente.')], ephemeral: true });
      return;
    }

    const result = Math.random() < 0.5 ? 'cara' : 'coroa';
    const won = choice === result;
    const delta = won ? amount : -amount;

    await economyRepository.update(interaction.guild!.id, interaction.user.id, { balance: account.balance + delta });

    await interaction.reply({
      embeds: [
        won
          ? successEmbed(`Deu **${result}**! Você ganhou ${formatCurrency(amount)}!`, '🪙 Coinflip')
          : errorEmbed(`Deu **${result}**. Você perdeu ${formatCurrency(amount)}.`, '🪙 Coinflip'),
      ],
    });
  },
};

export default command;
