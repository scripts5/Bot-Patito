import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { randomInt } from '../../utils/mathUtils.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rate')
    .setDescription('Avalia algo de 0 a 10 (por diversão).')
    .addStringOption((opt) => opt.setName('coisa').setDescription('O que avaliar').setRequired(true)) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const thing = interaction.options.getString('coisa', true);
    const score = randomInt(0, 10);
    await interaction.reply({ embeds: [successEmbed(`Eu daria **${score}/10** para "${thing}"`)] });
  },
};

export default command;
