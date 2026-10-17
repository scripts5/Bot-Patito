import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('flip').setDescription('Joga uma moeda para o alto.') as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const result = Math.random() < 0.5 ? 'Cara' : 'Coroa';
    await interaction.reply({ embeds: [successEmbed(`🪙 Deu **${result}**!`)] });
  },
};

export default command;
