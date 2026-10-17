import { readJson, writeJson } from '../jsonDatabase.js';

const FILE = 'levels';

export interface LevelAccount {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
  prestige: number;
  lastMessageAt: number | null;
}

function key(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

function defaults(guildId: string, userId: string): LevelAccount {
  return { userId, guildId, xp: 0, level: 0, prestige: 0, lastMessageAt: null };
}

function readAll(): Record<string, LevelAccount> {
  return readJson<Record<string, LevelAccount>>(FILE, {});
}

export function xpForLevel(level: number): number {
  return 5 * level ** 2 + 50 * level + 100;
}

export const levelRepository = {
  get(guildId: string, userId: string): LevelAccount {
    const all = readAll();
    return all[key(guildId, userId)] ?? defaults(guildId, userId);
  },
  leaderboard(guildId: string, limit = 10): LevelAccount[] {
    const all = readAll();
    return Object.values(all)
      .filter((a) => a.guildId === guildId)
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, limit);
  },
  async update(guildId: string, userId: string, patch: Partial<LevelAccount>): Promise<LevelAccount> {
    const all = readAll();
    const current = all[key(guildId, userId)] ?? defaults(guildId, userId);
    const updated = { ...current, ...patch };
    all[key(guildId, userId)] = updated;
    await writeJson(FILE, all);
    return updated;
  },
  async addXp(guildId: string, userId: string, amount: number): Promise<{ account: LevelAccount; leveledUp: boolean }> {
    const current = this.get(guildId, userId);
    let xp = current.xp + amount;
    let level = current.level;
    let leveledUp = false;
    while (xp >= xpForLevel(level)) {
      xp -= xpForLevel(level);
      level += 1;
      leveledUp = true;
    }
    const account = await this.update(guildId, userId, { xp, level, lastMessageAt: Date.now() });
    return { account, leveledUp };
  },
  async reset(guildId: string, userId: string): Promise<LevelAccount> {
    return this.update(guildId, userId, defaults(guildId, userId));
  },
};
