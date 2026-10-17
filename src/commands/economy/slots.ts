import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Joga na máquina caça-níqueis.')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor a apostar').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const result = await economyService.slots(interaction.guild!.id, interaction.user.id, amount);

    if (!result.ok) {
      await interaction.reply({ embeds: [errorEmbed(result.message)], ephemeral: true });
      return;
    }

    const display = `[ ${result.symbols.join(' | ')} ]`;
    await interaction.reply({
      embeds: [
        result.won
          ? successEmbed(`${display}\n${result.message} Ganhou ${formatCurrency(result.amount)}!`, '🎰 Slots')
          : errorEmbed(`${display}\n${result.message} Perdeu ${formatCurrency(result.amount)}.`, '🎰 Slots'),
      ],
    });
  },
};

export default command;
