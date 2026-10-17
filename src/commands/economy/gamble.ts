import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Aposta suas moedas (~45% de chance de ganhar).')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor a apostar').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const result = await economyService.bet(interaction.guild!.id, interaction.user.id, amount);

    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed(result.message)], ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: [result.won ? successEmbed(`Você ganhou ${formatCurrency(result.amount)}!`) : errorEmbed(`Você perdeu ${formatCurrency(result.amount)}.`)],
    });
  },
};

export default command;
