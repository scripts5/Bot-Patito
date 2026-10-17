import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('donate').setDescription('Informações sobre como apoiar o projeto.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [infoEmbed('Esse é um bot privado, sem sistema de doações público no momento.', 'Apoie')], ephemeral: true });
  },
};

export default command;
