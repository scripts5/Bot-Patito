import { readJson, writeJson } from '../jsonDatabase.js';
import { ModerationCase, CaseType } from '../../types/case.js';

const FILE = 'cases';

function readAll(): ModerationCase[] {
  return readJson<ModerationCase[]>(FILE, []);
}

export const caseRepository = {
  listByGuild(guildId: string): ModerationCase[] {
    return readAll().filter((c) => c.guildId === guildId);
  },
  getByCaseId(guildId: string, caseId: number): ModerationCase | undefined {
    return readAll().find((c) => c.guildId === guildId && c.caseId === caseId);
  },
  async create(
    guildId: string,
    type: CaseType,
    targetId: string,
    moderatorId: string,
    reason: string
  ): Promise<ModerationCase> {
    const all = readAll();
    const nextCaseId = Math.max(0, ...all.filter((c) => c.guildId === guildId).map((c) => c.caseId)) + 1;
    const newCase: ModerationCase = {
      caseId: nextCaseId,
      guildId,
      type,
      targetId,
      moderatorId,
      reason,
      createdAt: Date.now(),
    };
    all.push(newCase);
    await writeJson(FILE, all);
    return newCase;
  },
};
