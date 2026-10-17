import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('version').setDescription('Mostra a versão atual do bot.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [successEmbed('v1.0.0', 'Versão do Patito')], ephemeral: true });
  },
};

export default command;
