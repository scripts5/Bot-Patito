import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('vote').setDescription('Informações sobre votar pelo bot em sites de listagem.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [infoEmbed('Esse bot é privado e não está listado em sites públicos de votação.', 'Votar')], ephemeral: true });
  },
};

export default command;
