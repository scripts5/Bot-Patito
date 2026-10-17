import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../types/command.js';
import { musicService } from '../../services/musicService.js';
import { queueService } from '../../services/queueService.js';
import { playerService } from '../../services/playerService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Adiciona todas as músicas de uma playlist do YouTube à fila.')
    .addStringOption((opt) => opt.setName('link').setDescription('Link da playlist do YouTube').setRequired(true)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;
    const link = interaction.options.getString('link', true);

    if (!voiceChannel) {
      await interaction.reply({ embeds: [errorEmbed('Você precisa estar em um canal de voz.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();

    try {
      const playDl = await import('play-dl');
      if ((await playDl.validate(link)) !== 'yt_playlist') {
        await interaction.editReply({ embeds: [errorEmbed('Esse link não é uma playlist válida do YouTube.')] });
        return;
      }

      const playlist = await playDl.playlist_info(link, { incomplete: true });
      const videos = await playlist.all_videos();

      await musicService.join(voiceChannel, interaction.channelId);

      for (const video of videos) {
        queueService.add(interaction.guild!.id, {
          title: video.title ?? 'Sem título',
          url: video.url,
          duration: video.durationInSec ?? 0,
          requestedBy: interaction.user.id,
          thumbnail: video.thumbnails?.[0]?.url,
        });
      }

      if (!playerService.isPlaying(interaction.guild!.id)) {
        await musicService.playNext(interaction.guild!.id);
      }

      await interaction.editReply({ embeds: [successEmbed(`${videos.length} música(s) da playlist "${playlist.title}" adicionada(s) à fila.`)] });
    } catch (err) {
      logger.error('playlist', `Falha ao carregar playlist: ${err}`);
      await interaction.editReply({ embeds: [errorEmbed('Falha ao carregar a playlist. Verifique o link.')] });
    }
  },
};

export default command;
