import { backupService } from '../services/backupService.js';
import { databaseConfig } from '../config/databaseConfig.js';
import { logger } from '../utils/logger.js';

/**
 * Roda periodicamente (padrão: a cada 6h) fazendo backup de todos os data/*.json.
 */
export function startBackupJob(): void {
  setInterval(() => {
    const count = backupService.runFullBackup();
    logger.info('backupJob', `Backup automático concluído: ${count} arquivo(s).`);
  }, databaseConfig.autoBackupIntervalMs);
}
