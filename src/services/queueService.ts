export interface Track {
  title: string;
  url: string;
  duration: number; // segundos
  requestedBy: string;
  thumbnail?: string;
}

export interface GuildQueue {
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  tracks: Track[];
  playing: Track | null;
  loop: 'off' | 'track' | 'queue';
  autoplay: boolean;
  volume: number;
  history: Track[];
}

const queues = new Map<string, GuildQueue>();

export const queueService = {
  get(guildId: string): GuildQueue | undefined {
    return queues.get(guildId);
  },

  getOrCreate(guildId: string, voiceChannelId: string, textChannelId: string): GuildQueue {
    let queue = queues.get(guildId);
    if (!queue) {
      queue = {
        guildId,
        voiceChannelId,
        textChannelId,
        tracks: [],
        playing: null,
        loop: 'off',
        autoplay: false,
        volume: 100,
        history: [],
      };
      queues.set(guildId, queue);
    }
    return queue;
  },

  add(guildId: string, track: Track): void {
    const queue = queues.get(guildId);
    queue?.tracks.push(track);
  },

  next(guildId: string): Track | null {
    const queue = queues.get(guildId);
    if (!queue) return null;

    if (queue.playing && queue.loop === 'track') {
      return queue.playing;
    }

    if (queue.playing) {
      queue.history.push(queue.playing);
      if (queue.loop === 'queue') queue.tracks.push(queue.playing);
    }

    const next = queue.tracks.shift() ?? null;
    queue.playing = next;
    return next;
  },

  remove(guildId: string, index: number): Track | null {
    const queue = queues.get(guildId);
    if (!queue || index < 0 || index >= queue.tracks.length) return null;
    return queue.tracks.splice(index, 1)[0];
  },

  clear(guildId: string): void {
    const queue = queues.get(guildId);
    if (queue) queue.tracks = [];
  },

  shuffle(guildId: string): void {
    const queue = queues.get(guildId);
    if (!queue) return;
    for (let i = queue.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue.tracks[i], queue.tracks[j]] = [queue.tracks[j], queue.tracks[i]];
    }
  },

  destroy(guildId: string): void {
    queues.delete(guildId);
  },
};
