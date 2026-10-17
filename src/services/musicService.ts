import { StreamType } from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import { playerService } from './playerService.js';
import { queueService, Track } from './queueService.js';
import { logger } from '../utils/logger.js';

/**
 * Camada de resolução de música. Usa "play-dl" para buscar e transformar links/termos
 * de busca do YouTube em streams de áudio reais.
 *
 * Dependência necessária (adicionada ao package.json): play-dl, @discordjs/voice, libsodium-wrappers, ffmpeg-static.
 * Rode `npm install` após aplicar os arquivos para essas dependências serem baixadas.
 */
export const musicService = {
  async resolve(query: string): Promise<Track | null> {
    try {
      const playDl = await import('play-dl');

      let url = query;
      if (!playDl.yt_validate(query)) {
        const results = await playDl.search(query, { limit: 1, source: { youtube: 'video' } });
        if (!results.length) return null;
        url = results[0].url;
      }

      const info = await playDl.video_basic_info(url);
      return {
        title: info.video_details.title ?? 'Sem título',
        url: info.video_details.url,
        duration: info.video_details.durationInSec ?? 0,
        requestedBy: '',
        thumbnail: info.video_details.thumbnails?.[0]?.url,
      };
    } catch (err) {
      logger.error('musicService', `Falha ao resolver "${query}": ${err}`);
      return null;
    }
  },

  async join(channel: VoiceBasedChannel, textChannelId: string) {
    const alreadyConnected = playerService.has(channel.guild.id);
    const entry = playerService.connect(channel);
    await playerService.waitReady(entry.connection);
    queueService.getOrCreate(channel.guild.id, channel.id, textChannelId);

    if (!alreadyConnected) {
      // Registra o avanço automático de faixas (só uma vez por conexão).
      playerService.onIdle(channel.guild.id, () => {
        this.playNext(channel.guild.id)
          .then(async (track) => {
            if (!track) return;
            const textChannel = channel.guild.channels.cache.get(textChannelId) as import('discord.js').TextChannel | undefined;
            await textChannel?.send(`🎶 Tocando agora: **${track.title}**`).catch(() => undefined);
          })
          .catch((err) => logger.error('musicService', `Falha no avanço automático: ${err}`));
      });

      playerService.onError(channel.guild.id, () => {
        this.playNext(channel.guild.id).catch(() => undefined);
      });
    }

    return entry;
  },

  async playNext(guildId: string): Promise<Track | null> {
    const track = queueService.next(guildId);
    if (!track) {
      playerService.stop(guildId);
      return null;
    }

    try {
      const playDl = await import('play-dl');
      const stream = await playDl.stream(track.url);
      playerService.playStream(guildId, stream.stream, stream.type as unknown as StreamType);
    } catch (err) {
      logger.error('musicService', `Falha ao reproduzir "${track.title}": ${err}`);
      throw new Error(`Não consegui reproduzir "${track.title}". Pulando para a próxima.`);
    }

    return track;
  },

  leave(guildId: string): void {
    playerService.disconnect(guildId);
    queueService.destroy(guildId);
  },
};
