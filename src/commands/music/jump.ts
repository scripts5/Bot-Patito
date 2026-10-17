import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { musicService } from '../../services/musicService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Pula direto para uma posição específica da fila.')
    .addIntegerOption((opt) => opt.setName('posicao').setDescription('Posição na fila').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const position = interaction.options.getInteger('posicao', true);
    const queue = queueService.get(interaction.guild!.id);

    if (!queue || position > queue.tracks.length) {
      await interaction.reply({ embeds: [errorEmbed('Posição inválida.')], ephemeral: true });
      return;
    }

    queue.tracks.splice(0, position - 1);
    await interaction.deferReply();
    const track = await musicService.playNext(interaction.guild!.id);
    await interaction.editReply({ embeds: [successEmbed(track ? `⏭️ Pulado para: **${track.title}**` : 'Fila esvaziada.')] });
  },
};

export default command;
