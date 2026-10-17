import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';

const TRANSCRIPTS_DIR = path.resolve(process.cwd(), 'data', 'transcripts');
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

/**
 * Roda 1x por dia: remove transcripts antigos e arquivos temporários que sobraram.
 */
export function startCleanupJob(): void {
  setInterval(() => {
    if (!fs.existsSync(TRANSCRIPTS_DIR)) return;

    const now = Date.now();
    const files = fs.readdirSync(TRANSCRIPTS_DIR);
    let removed = 0;

    for (const file of files) {
      const filePath = path.join(TRANSCRIPTS_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > MAX_AGE_MS) {
        fs.unlinkSync(filePath);
        removed++;
      }
    }

    if (removed > 0) logger.info('cleanupJob', `${removed} arquivo(s) antigo(s) removido(s).`);
  }, 24 * 60 * 60 * 1000);
}
