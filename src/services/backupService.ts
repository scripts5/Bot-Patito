import { backupAllData, pruneOldBackups } from '../database/backup.js';

export const backupService = {
  runFullBackup(): number {
    const count = backupAllData();
    pruneOldBackups();
    return count;
  },
};
