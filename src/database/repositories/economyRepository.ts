import { readJson, writeJson } from '../jsonDatabase.js';

const FILE = 'economy';

export interface EconomyAccount {
  userId: string;
  guildId: string;
  balance: number;
  bank: number;
  lastDaily: number | null;
  lastWeekly: number | null;
  lastMonthly: number | null;
  lastWork: number | null;
  inventory: Record<string, number>;
}

function key(guildId: string, userId: string): string {
  return `${guildId}:${userId}`;
}

function defaults(guildId: string, userId: string): EconomyAccount {
  return {
    userId,
    guildId,
    balance: 0,
    bank: 0,
    lastDaily: null,
    lastWeekly: null,
    lastMonthly: null,
    lastWork: null,
    inventory: {},
  };
}

function readAll(): Record<string, EconomyAccount> {
  return readJson<Record<string, EconomyAccount>>(FILE, {});
}

export const economyRepository = {
  get(guildId: string, userId: string): EconomyAccount {
    const all = readAll();
    return all[key(guildId, userId)] ?? defaults(guildId, userId);
  },
  leaderboard(guildId: string, limit = 10): EconomyAccount[] {
    const all = readAll();
    return Object.values(all)
      .filter((a) => a.guildId === guildId)
      .sort((a, b) => b.balance + b.bank - (a.balance + a.bank))
      .slice(0, limit);
  },
  async update(guildId: string, userId: string, patch: Partial<EconomyAccount>): Promise<EconomyAccount> {
    const all = readAll();
    const current = all[key(guildId, userId)] ?? defaults(guildId, userId);
    const updated = { ...current, ...patch };
    all[key(guildId, userId)] = updated;
    await writeJson(FILE, all);
    return updated;
  },
  async addBalance(guildId: string, userId: string, amount: number): Promise<EconomyAccount> {
    const current = this.get(guildId, userId);
    return this.update(guildId, userId, { balance: current.balance + amount });
  },
};
