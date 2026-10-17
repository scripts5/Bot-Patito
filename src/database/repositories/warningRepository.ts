import { readJson, writeJson } from '../jsonDatabase.js';
import { Warning } from '../../types/warning.js';
import { randomString } from '../../utils/stringUtils.js';

const FILE = 'warnings';

function readAll(): Warning[] {
  return readJson<Warning[]>(FILE, []);
}

export const warningRepository = {
  listByUser(guildId: string, userId: string): Warning[] {
    return readAll().filter((w) => w.guildId === guildId && w.userId === userId);
  },
  async add(data: Omit<Warning, 'id' | 'createdAt'>): Promise<Warning> {
    const all = readAll();
    const warning: Warning = { ...data, id: randomString(10), createdAt: Date.now() };
    all.push(warning);
    await writeJson(FILE, all);
    return warning;
  },
  async remove(warningId: string): Promise<boolean> {
    const all = readAll();
    const next = all.filter((w) => w.id !== warningId);
    const removed = next.length !== all.length;
    if (removed) await writeJson(FILE, next);
    return removed;
  },
};
