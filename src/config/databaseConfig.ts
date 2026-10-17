export const databaseConfig = {
  dataDir: 'data',
  backupDir: 'backups',
  autoBackupIntervalMs: 6 * 60 * 60 * 1000, // 6 horas
  backupRetentionMs: 7 * 24 * 60 * 60 * 1000, // 7 dias
} as const;
