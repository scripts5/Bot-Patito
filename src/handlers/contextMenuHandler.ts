import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';

// Reaproveita a mesma coleção client.commands: comandos de menu de contexto
// (UserContextMenuCommandBuilder / MessageContextMenuCommandBuilder) são registrados
// juntos, distinguidos pelo campo "type" do builder no momento do deploy.
const CONTEXT_MENUS_DIR = path.resolve(process.cwd(), 'src', 'commands');

export async function loadContextMenus(client: PatitoClient): Promise<void> {
  const files = getAllFiles(CONTEXT_MENUS_DIR, ['.ts', '.js']).filter((f) => f.includes('contextmenu'));
  let loaded = 0;

  for (const file of files) {
    try {
      const imported = await import(pathToFileURL(file).href);
      const command = imported.default;
      if (!command?.data?.name || typeof command.execute !== 'function') continue;
      if (client.commands.has(command.data.name)) continue;
      client.commands.set(command.data.name, command);
      loaded++;
    } catch (err) {
      logger.error('contextMenuHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
    }
  }

  if (loaded > 0) {
    logger.success('contextMenuHandler', `${loaded} comando(s) de menu de contexto carregado(s).`);
  }
}
