import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('clear-queue').setDescription('Limpa a fila de músicas (mantém a atual tocando).') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    queueService.clear(interaction.guild!.id);
    await interaction.reply({ embeds: [successEmbed('Fila limpa.')] });
  },
};

export default command;
