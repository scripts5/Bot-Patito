import { TextChannel } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { ensureDir } from '../utils/fileUtils.js';
import { formatDate } from '../utils/dateUtils.js';

const TRANSCRIPTS_DIR = path.resolve(process.cwd(), 'data', 'transcripts');

export const transcriptService = {
  async generate(channel: TextChannel): Promise<string> {
    ensureDir(TRANSCRIPTS_DIR);

    const messages = await channel.messages.fetch({ limit: 100 });
    const sorted = [...messages.values()].reverse();

    const lines = sorted.map((m) => {
      const time = formatDate(m.createdAt);
      const content = m.content || '[anexo/embed]';
      return `[${time}] ${m.author.tag}: ${content}`;
    });

    const fileName = `transcript-${channel.id}-${Date.now()}.txt`;
    const filePath = path.join(TRANSCRIPTS_DIR, fileName);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');

    return filePath;
  },
};
