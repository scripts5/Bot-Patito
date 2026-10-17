export type TicketStatus = 'open' | 'claimed' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Ticket {
  id: string;
  guildId: string;
  channelId: string;
  authorId: string;
  claimedBy: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  reason: string | null;
  createdAt: number;
  closedAt: number | null;
  closedBy: string | null;
  members: string[];
}
