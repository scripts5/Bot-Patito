import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { randomInt } from '../../utils/mathUtils.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Rola um dado.')
    .addIntegerOption((opt) => opt.setName('lados').setDescription('Número de lados (padrão 6)').setMinValue(2).setMaxValue(1000)) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const sides = interaction.options.getInteger('lados') ?? 6;
    const result = randomInt(1, sides);
    await interaction.reply({ embeds: [successEmbed(`🎲 Você tirou **${result}** (d${sides})`)] });
  },
};

export default command;
