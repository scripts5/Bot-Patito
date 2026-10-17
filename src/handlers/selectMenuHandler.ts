import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';
import { SelectMenuHandlerModule } from '../types/selectMenu.js';

const SELECT_MENUS_DIR = path.resolve(process.cwd(), 'src', 'interactions', 'selectMenus');

export async function loadSelectMenus(client: PatitoClient): Promise<void> {
  client.selectMenus = new Collection();
  const files = getAllFiles(SELECT_MENUS_DIR, ['.ts', '.js']);
  let loaded = 0;

  for (const file of files) {
    try {
      const imported = await import(pathToFileURL(file).href);
      const mod: SelectMenuHandlerModule | undefined = imported.default;
      if (!mod?.customId || typeof mod.execute !== 'function') continue;
      client.selectMenus.set(mod.customId, mod);
      loaded++;
    } catch (err) {
      logger.error('selectMenuHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
    }
  }

  logger.success('selectMenuHandler', `${loaded} handler(s) de menu carregado(s).`);
}

export function findSelectMenu(client: PatitoClient, customId: string): SelectMenuHandlerModule | null {
  for (const [key, mod] of client.selectMenus) {
    if (typeof key === 'string' && key === customId) return mod;
    if (key instanceof RegExp && key.test(customId)) return mod;
  }
  return null;
}
