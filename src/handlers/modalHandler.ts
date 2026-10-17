import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';
import { ModalHandlerModule } from '../types/modal.js';

const MODALS_DIR = path.resolve(process.cwd(), 'src', 'interactions', 'modals');

export async function loadModals(client: PatitoClient): Promise<void> {
  client.modals = new Collection();
  const files = getAllFiles(MODALS_DIR, ['.ts', '.js']);
  let loaded = 0;

  for (const file of files) {
    try {
      const imported = await import(pathToFileURL(file).href);
      const mod: ModalHandlerModule | undefined = imported.default;
      if (!mod?.customId || typeof mod.execute !== 'function') continue;
      client.modals.set(mod.customId, mod);
      loaded++;
    } catch (err) {
      logger.error('modalHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
    }
  }

  logger.success('modalHandler', `${loaded} handler(s) de modal carregado(s).`);
}

export function findModal(client: PatitoClient, customId: string): ModalHandlerModule | null {
  for (const [key, mod] of client.modals) {
    if (typeof key === 'string' && key === customId) return mod;
    if (key instanceof RegExp && key.test(customId)) return mod;
  }
  return null;
}
