import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Embaralha a fila de músicas.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    queueService.shuffle(interaction.guild!.id);
    await interaction.reply({ embeds: [successEmbed('🔀 Fila embaralhada.')] });
  },
};

export default command;
