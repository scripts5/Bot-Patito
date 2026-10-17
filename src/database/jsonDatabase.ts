import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../utils/logger.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Fila de escrita por arquivo, para nunca gravar duas vezes ao mesmo tempo (evita corrupção).
const writeQueues = new Map<string, Promise<void>>();

function filePath(name: string): string {
  return path.join(DATA_DIR, `${name}.json`);
}

/**
 * Lê um arquivo JSON de data/<name>.json.
 * Cria o arquivo com defaultValue se não existir.
 * Tenta recuperar de um backup se o arquivo estiver corrompido.
 */
export function readJson<T>(name: string, defaultValue: T): T {
  const target = filePath(name);

  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }

  try {
    const raw = fs.readFileSync(target, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    logger.error('jsonDatabase', `Arquivo ${name}.json corrompido, tentando recuperar de backup. (${err})`);
    const recovered = recoverFromBackup<T>(name);
    if (recovered !== null) return recovered;
    // Sem backup disponível: reseta para o valor padrão, mas preserva o arquivo corrompido para inspeção.
    fs.copyFileSync(target, `${target}.corrupted-${Date.now()}.bak`);
    fs.writeFileSync(target, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
}

function recoverFromBackup<T>(name: string): T | null {
  const candidates = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith(`${name}-`) && f.endsWith('.json'))
    .sort()
    .reverse();

  for (const candidate of candidates) {
    try {
      const raw = fs.readFileSync(path.join(BACKUP_DIR, candidate), 'utf-8');
      const parsed = JSON.parse(raw) as T;
      logger.warn('jsonDatabase', `Recuperado ${name}.json a partir do backup ${candidate}.`);
      return parsed;
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Grava dados em data/<name>.json de forma segura (fila por arquivo, escrita atômica via arquivo temporário).
 */
export function writeJson<T>(name: string, data: T): Promise<void> {
  const target = filePath(name);
  const previous = writeQueues.get(name) ?? Promise.resolve();

  const task = previous
    .catch(() => undefined)
    .then(async () => {
      const tmpPath = `${target}.tmp`;
      await fs.promises.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      await fs.promises.rename(tmpPath, target);
    })
    .catch((err) => {
      logger.error('jsonDatabase', `Falha ao gravar ${name}.json: ${err}`);
    });

  writeQueues.set(name, task);
  return task;
}

export function backupNow(name: string): void {
  const target = filePath(name);
  if (!fs.existsSync(target)) return;
  const backupName = `${name}-${Date.now()}.json`;
  fs.copyFileSync(target, path.join(BACKUP_DIR, backupName));
}
