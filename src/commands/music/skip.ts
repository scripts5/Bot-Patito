import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { musicService } from '../../services/musicService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Pula para a próxima música da fila.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const track = await musicService.playNext(interaction.guild!.id);
      await interaction.editReply({ embeds: [successEmbed(track ? `⏭️ Tocando agora: **${track.title}**` : 'Fila vazia, reprodução encerrada.')] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
