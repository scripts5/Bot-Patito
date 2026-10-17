import { readJson, writeJson, backupNow } from './jsonDatabase.js';

/**
 * Fachada central do banco de dados em JSON.
 * Os repositories (src/database/repositories) usam essas funções por trás dos panos.
 * Isso mantém um único ponto de entrada para leitura/escrita/backup de qualquer coleção.
 */
export const db = {
  read: readJson,
  write: writeJson,
  backup: backupNow,
};

export type { };
