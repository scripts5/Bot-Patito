import { readJson, writeJson } from '../jsonDatabase.js';

const FILE = 'profiles';

export interface UserProfile {
  userId: string;
  bio: string | null;
  color: string | null;
  background: string | null;
  badges: string[];
  reputation: number;
}

function defaults(userId: string): UserProfile {
  return { userId, bio: null, color: null, background: null, badges: [], reputation: 0 };
}

function readAll(): Record<string, UserProfile> {
  return readJson<Record<string, UserProfile>>(FILE, {});
}

export const userRepository = {
  get(userId: string): UserProfile {
    const all = readAll();
    return all[userId] ?? defaults(userId);
  },
  async update(userId: string, patch: Partial<UserProfile>): Promise<UserProfile> {
    const all = readAll();
    const current = all[userId] ?? defaults(userId);
    const updated = { ...current, ...patch };
    all[userId] = updated;
    await writeJson(FILE, all);
    return updated;
  },
  async addReputation(userId: string, amount: number): Promise<UserProfile> {
    const current = this.get(userId);
    return this.update(userId, { reputation: current.reputation + amount });
  },
};
