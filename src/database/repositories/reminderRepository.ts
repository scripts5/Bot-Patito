import { readJson, writeJson } from '../jsonDatabase.js';
import { Reminder } from '../../types/reminder.js';
import { randomString } from '../../utils/stringUtils.js';

const FILE = 'reminders';

function readAll(): Reminder[] {
  return readJson<Reminder[]>(FILE, []);
}

export const reminderRepository = {
  listPending(): Reminder[] {
    return readAll().filter((r) => !r.sent);
  },
  listByUser(userId: string): Reminder[] {
    return readAll().filter((r) => r.userId === userId && !r.sent);
  },
  async create(data: Omit<Reminder, 'id' | 'createdAt' | 'sent'>): Promise<Reminder> {
    const all = readAll();
    const reminder: Reminder = { ...data, id: randomString(10), createdAt: Date.now(), sent: false };
    all.push(reminder);
    await writeJson(FILE, all);
    return reminder;
  },
  async markSent(id: string): Promise<void> {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx === -1) return;
    all[idx].sent = true;
    await writeJson(FILE, all);
  },
  async remove(id: string, userId: string): Promise<boolean> {
    const all = readAll();
    const next = all.filter((r) => !(r.id === id && r.userId === userId));
    const removed = next.length !== all.length;
    if (removed) await writeJson(FILE, next);
    return removed;
  },
  async clearForUser(userId: string): Promise<number> {
    const all = readAll();
    const next = all.filter((r) => r.userId !== userId);
    const removedCount = all.length - next.length;
    if (removedCount > 0) await writeJson(FILE, next);
    return removedCount;
  },
};
