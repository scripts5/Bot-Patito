import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { Command, PatitoClient } from '../types/command.js';

const COMMANDS_DIR = path.resolve(process.cwd(), 'src', 'commands');

/**
 * Carrega todos os comandos recursivamente de src/commands/**, valida o export
 * e preenche client.commands. Nunca permite dois comandos com o mesmo nome.
 */
export async function loadCommands(client: PatitoClient): Promise<void> {
  client.commands = new Collection<string, Command>();

  const files = getAllFiles(COMMANDS_DIR, ['.ts', '.js']);
  let loaded = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(file).href;
      const imported = await import(moduleUrl);
      const command: Command | undefined = imported.default ?? imported.command;

      if (!command || !command.data || typeof command.execute !== 'function') {
        logger.warn('commandHandler', `Arquivo ignorado (export inválido): ${path.relative(process.cwd(), file)}`);
        skipped++;
        continue;
      }

      const name = command.data.name;

      if (!name || !/^[a-z0-9_-]{1,32}$/.test(name)) {
        logger.warn('commandHandler', `Comando com nome inválido ignorado: ${name} (${file})`);
        skipped++;
        continue;
      }

      if (client.commands.has(name)) {
        logger.warn(
          'commandHandler',
          `Comando duplicado ignorado: "${name}" já foi carregado. Arquivo: ${path.relative(process.cwd(), file)}`
        );
        skipped++;
        continue;
      }

      // Deriva a categoria a partir do nome da subpasta (src/commands/<categoria>/arquivo.ts).
      if (!command.category) {
        const relative = path.relative(COMMANDS_DIR, file);
        command.category = relative.split(path.sep)[0];
      }

      client.commands.set(name, command);
      loaded++;
    } catch (err) {
      logger.error('commandHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
      skipped++;
    }
  }

  logger.success('commandHandler', `${loaded} comando(s) carregado(s), ${skipped} ignorado(s)/vazio(s).`);
}
