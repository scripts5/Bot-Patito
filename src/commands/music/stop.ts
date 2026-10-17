import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { musicService } from '../../services/musicService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('stop').setDescription('Para a música, limpa a fila e sai do canal de voz.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    musicService.leave(interaction.guild!.id);
    await interaction.reply({ embeds: [successEmbed('⏹️ Reprodução encerrada.')] });
  },
};

export default command;
