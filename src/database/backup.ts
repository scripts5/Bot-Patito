import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

/**
 * Faz backup de todos os arquivos data/*.json para backups/, com timestamp.
 * Chamado periodicamente pelo backupJob.
 */
export function backupAllData(): number {
  if (!fs.existsSync(DATA_DIR)) return 0;
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
  const timestamp = Date.now();

  for (const file of files) {
    const name = file.replace(/\.json$/, '');
    fs.copyFileSync(path.join(DATA_DIR, file), path.join(BACKUP_DIR, `${name}-${timestamp}.json`));
  }

  logger.info('backup', `Backup concluído: ${files.length} arquivo(s) salvos em backups/.`);
  return files.length;
}

/**
 * Remove backups mais antigos que "maxAgeMs", mantendo pelo menos "keepMinimum" por arquivo base.
 */
export function pruneOldBackups(maxAgeMs = 7 * 24 * 60 * 60 * 1000): void {
  if (!fs.existsSync(BACKUP_DIR)) return;
  const now = Date.now();
  const files = fs.readdirSync(BACKUP_DIR);

  for (const file of files) {
    const match = file.match(/-(\d+)\.json$/);
    if (!match) continue;
    const timestamp = Number(match[1]);
    if (now - timestamp > maxAgeMs) {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
    }
  }
}
