import { logger } from '../utils/logger.js';

interface Migration {
  id: string;
  description: string;
  run: () => Promise<void>;
}

// Adicione novas migrações aqui conforme o schema dos JSONs evoluir.
const migrations: Migration[] = [];

export async function runMigrations(): Promise<void> {
  for (const migration of migrations) {
    try {
      await migration.run();
      logger.info('migration', `Migração aplicada: ${migration.id} - ${migration.description}`);
    } catch (err) {
      logger.error('migration', `Falha na migração ${migration.id}: ${err}`);
      throw err;
    }
  }
}
