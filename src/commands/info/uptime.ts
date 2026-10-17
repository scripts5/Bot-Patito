import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';
import { msToHuman } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('uptime').setDescription('Mostra há quanto tempo o bot está online.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [successEmbed(msToHuman(interaction.client.uptime ?? 0), 'Uptime')] });
  },
};

export default command;
