import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnection,
  VoiceConnectionStatus,
  entersState,
  StreamType,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import { VoiceBasedChannel } from 'discord.js';
import { logger } from '../utils/logger.js';

interface GuildPlayer {
  connection: VoiceConnection;
  player: AudioPlayer;
}

const players = new Map<string, GuildPlayer>();

export const playerService = {
  connect(channel: VoiceBasedChannel): GuildPlayer {
    let entry = players.get(channel.guild.id);
    if (entry) return entry;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
    });

    const player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
    });

    connection.subscribe(player);
    entry = { connection, player };
    players.set(channel.guild.id, entry);
    return entry;
  },

  async waitReady(connection: VoiceConnection): Promise<void> {
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);
    } catch (err) {
      connection.destroy();
      throw new Error('Não consegui conectar ao canal de voz a tempo.');
    }
  },

  /**
   * Recebe uma URL de stream de áudio já resolvida (via musicService/resolvedores externos)
   * e reproduz no player do servidor.
   */
  playStream(guildId: string, stream: NodeJS.ReadableStream, type: StreamType = StreamType.Arbitrary): void {
    const entry = players.get(guildId);
    if (!entry) throw new Error('Nenhuma conexão de voz ativa para esse servidor.');

    const resource = createAudioResource(stream, { inputType: type });
    entry.player.play(resource);
  },

  pause(guildId: string): boolean {
    return players.get(guildId)?.player.pause() ?? false;
  },

  resume(guildId: string): boolean {
    return players.get(guildId)?.player.unpause() ?? false;
  },

  stop(guildId: string): boolean {
    return players.get(guildId)?.player.stop(true) ?? false;
  },

  isPlaying(guildId: string): boolean {
    return players.get(guildId)?.player.state.status === AudioPlayerStatus.Playing;
  },

  onIdle(guildId: string, callback: () => void): void {
    const entry = players.get(guildId);
    if (!entry) return;
    entry.player.on(AudioPlayerStatus.Idle, callback);
  },

  onError(guildId: string, callback: (err: Error) => void): void {
    const entry = players.get(guildId);
    if (!entry) return;
    entry.player.on('error', (err) => {
      logger.error('playerService', `Erro no player de ${guildId}: ${err.message}`);
      callback(err);
    });
  },

  disconnect(guildId: string): void {
    const entry = players.get(guildId);
    if (!entry) return;
    entry.player.stop(true);
    entry.connection.destroy();
    players.delete(guildId);
  },

  has(guildId: string): boolean {
    return players.has(guildId);
  },
};
