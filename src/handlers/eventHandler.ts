import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ClientEvents } from 'discord.js';
import { getAllFiles } from '../utils/fileUtils.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';

const EVENTS_DIR = path.resolve(process.cwd(), 'src', 'events');

export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}

/**
 * Carrega todos os eventos recursivamente de src/events/** e registra no client.
 */
export async function loadEvents(client: PatitoClient): Promise<void> {
  const files = getAllFiles(EVENTS_DIR, ['.ts', '.js']);
  let loaded = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const moduleUrl = pathToFileURL(file).href;
      const imported = await import(moduleUrl);
      const event: BotEvent | undefined = imported.default ?? imported.event;

      if (!event || !event.name || typeof event.execute !== 'function') {
        logger.debug('eventHandler', `Evento vazio/ignorado: ${path.relative(process.cwd(), file)}`);
        skipped++;
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
      loaded++;
    } catch (err) {
      logger.error('eventHandler', `Erro ao carregar ${path.relative(process.cwd(), file)}: ${err}`);
      skipped++;
    }
  }

  logger.success('eventHandler', `${loaded} evento(s) carregado(s), ${skipped} ignorado(s)/vazio(s).`);
}
