import { readJson, writeJson } from '../jsonDatabase.js';
import { Ticket, TicketPriority } from '../../types/ticket.js';
import { randomString } from '../../utils/stringUtils.js';

const FILE = 'tickets';

function readAll(): Ticket[] {
  return readJson<Ticket[]>(FILE, []);
}

export const ticketRepository = {
  listOpenByGuild(guildId: string): Ticket[] {
    return readAll().filter((t) => t.guildId === guildId && t.status !== 'closed');
  },
  countOpenByUser(guildId: string, authorId: string): number {
    return readAll().filter(
      (t) => t.guildId === guildId && t.authorId === authorId && t.status !== 'closed'
    ).length;
  },
  getByChannel(channelId: string): Ticket | undefined {
    return readAll().find((t) => t.channelId === channelId);
  },
  async create(guildId: string, channelId: string, authorId: string, reason: string | null): Promise<Ticket> {
    const all = readAll();
    const ticket: Ticket = {
      id: randomString(10),
      guildId,
      channelId,
      authorId,
      claimedBy: null,
      status: 'open',
      priority: 'medium',
      reason,
      createdAt: Date.now(),
      closedAt: null,
      closedBy: null,
      members: [authorId],
    };
    all.push(ticket);
    await writeJson(FILE, all);
    return ticket;
  },
  async update(channelId: string, patch: Partial<Ticket>): Promise<Ticket | null> {
    const all = readAll();
    const idx = all.findIndex((t) => t.channelId === channelId);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await writeJson(FILE, all);
    return all[idx];
  },
  async setPriority(channelId: string, priority: TicketPriority): Promise<Ticket | null> {
    return this.update(channelId, { priority });
  },
  async close(channelId: string, closedBy: string): Promise<Ticket | null> {
    return this.update(channelId, { status: 'closed', closedAt: Date.now(), closedBy });
  },
};
