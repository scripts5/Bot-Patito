import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('commands').setDescription('Mostra o total de comandos carregados.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    await interaction.reply({ embeds: [successEmbed(`${client.commands.size} comandos carregados. Use /help para navegar por categoria.`)] });
  },
};

export default command;
