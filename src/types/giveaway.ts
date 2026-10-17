export interface Giveaway {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  prize: string;
  winnersCount: number;
  hostId: string;
  endsAt: number;
  ended: boolean;
  paused: boolean;
  participants: string[];
  winners: string[];
}
