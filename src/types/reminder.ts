export interface Reminder {
  id: string;
  userId: string;
  guildId: string | null;
  channelId: string;
  message: string;
  remindAt: number;
  createdAt: number;
  sent: boolean;
}
