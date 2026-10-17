import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';
import { ButtonHandlerModule } from '../types/button.js';

const BUTTONS_DIR = path.resolve(process.cwd(), 'src', 'interactions', 'buttons');

export async function loadButtons(client: PatitoClient): Promise<void> {
  client.buttons = new Collection();
  const files = getAllFiles(BUTTONS_DIR, ['.ts', '.js']);
  let loaded = 0;

  for (const file of files) {
    try {
      const imported = await import(pathToFileURL(file).href);
      const modules: ButtonHandlerModule[] = imported.default
        ? Array.isArray(imported.default)
          ? imported.default
          : [imported.default]
        : [];

      for (const mod of modules) {
        if (!mod?.customId || typeof mod.execute !== 'function') continue;
        client.buttons.set(mod.customId, mod);
        loaded++;
      }
    } catch (err) {
      logger.error('buttonHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
    }
  }

  logger.success('buttonHandler', `${loaded} handler(s) de botão carregado(s).`);
}

export async function executeButton(client: PatitoClient, customId: string): Promise<ButtonHandlerModule | null> {
  for (const [key, mod] of client.buttons) {
    if (typeof key === 'string' && key === customId) return mod;
    if (key instanceof RegExp && key.test(customId)) return mod;
  }
  return null;
}
