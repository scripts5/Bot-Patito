import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { loadCommands } from '../../handlers/commandHandler.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('reload').setDescription('[DONO] Recarrega todos os comandos em memória (sem reiniciar o processo).') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const client = interaction.client as PatitoClient;
    await loadCommands(client);
    await interaction.editReply({ embeds: [successEmbed(`${client.commands.size} comando(s) recarregado(s) em memória.`)] });
  },
};

export default command;
