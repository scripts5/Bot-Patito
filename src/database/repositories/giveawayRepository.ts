import { readJson, writeJson } from '../jsonDatabase.js';
import { Giveaway } from '../../types/giveaway.js';
import { randomString } from '../../utils/stringUtils.js';

const FILE = 'giveaways';

function readAll(): Giveaway[] {
  return readJson<Giveaway[]>(FILE, []);
}

export const giveawayRepository = {
  listActive(): Giveaway[] {
    return readAll().filter((g) => !g.ended);
  },
  listByGuild(guildId: string): Giveaway[] {
    return readAll().filter((g) => g.guildId === guildId);
  },
  getById(id: string): Giveaway | undefined {
    return readAll().find((g) => g.id === id);
  },
  async create(data: Omit<Giveaway, 'id' | 'ended' | 'paused' | 'participants' | 'winners'>): Promise<Giveaway> {
    const all = readAll();
    const giveaway: Giveaway = {
      ...data,
      id: randomString(10),
      ended: false,
      paused: false,
      participants: [],
      winners: [],
    };
    all.push(giveaway);
    await writeJson(FILE, all);
    return giveaway;
  },
  async update(id: string, patch: Partial<Giveaway>): Promise<Giveaway | null> {
    const all = readAll();
    const idx = all.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    await writeJson(FILE, all);
    return all[idx];
  },
  async addParticipant(id: string, userId: string): Promise<boolean> {
    const all = readAll();
    const giveaway = all.find((g) => g.id === id);
    if (!giveaway || giveaway.participants.includes(userId)) return false;
    giveaway.participants.push(userId);
    await writeJson(FILE, all);
    return true;
  },
};
