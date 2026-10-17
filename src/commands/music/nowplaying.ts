import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { colors } from '../../config/colors.js';
import { msToHuman } from '../../utils/timeUtils.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('nowplaying').setDescription('Mostra a música que está tocando agora.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);

    if (!queue?.playing) {
      await interaction.reply({ embeds: [errorEmbed('Nada tocando no momento.')] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('🎵 Tocando agora')
      .setDescription(`**${queue.playing.title}**`)
      .addFields({ name: 'Duração', value: msToHuman(queue.playing.duration * 1000), inline: true }, { name: 'Pedido por', value: `<@${queue.playing.requestedBy}>`, inline: true });

    if (queue.playing.thumbnail) embed.setThumbnail(queue.playing.thumbnail);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
