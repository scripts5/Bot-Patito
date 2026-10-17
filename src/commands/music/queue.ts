import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { colors } from '../../config/colors.js';
import { msToHuman } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Mostra a fila de músicas atual.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);

    if (!queue || (!queue.playing && queue.tracks.length === 0)) {
      await interaction.reply('A fila está vazia.');
      return;
    }

    const embed = new EmbedBuilder().setColor(colors.primary).setTitle('🎶 Fila de músicas');

    if (queue.playing) {
      embed.addFields({ name: 'Tocando agora', value: `**${queue.playing.title}** (${msToHuman(queue.playing.duration * 1000)})` });
    }

    if (queue.tracks.length > 0) {
      embed.addFields({
        name: `Próximas (${queue.tracks.length})`,
        value: queue.tracks.slice(0, 10).map((t, i) => `${i + 1}. ${t.title}`).join('\n'),
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
