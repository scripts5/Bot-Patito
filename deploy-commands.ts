import 'dotenv/config';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REST, Routes } from 'discord.js';
import { getAllFiles } from './src/utils/fileUtils.js';
import { logger } from './src/utils/logger.js';

const COMMANDS_DIR = path.resolve(process.cwd(), 'src', 'commands');

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`[deploy-commands] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

async function main() {
  const token = requiredEnv('DISCORD_TOKEN');
  const clientId = requiredEnv('CLIENT_ID');
  const guildId = requiredEnv('GUILD_ID');

  const files = getAllFiles(COMMANDS_DIR, ['.ts', '.js']);
  const commandsJson: unknown[] = [];
  const seenNames = new Set<string>();
  let skipped = 0;

  for (const file of files) {
    try {
      const imported = await import(pathToFileURL(file).href);
      const command = imported.default ?? imported.command;

      if (!command?.data || typeof command.data.toJSON !== 'function') {
        skipped++;
        continue;
      }

      const json = command.data.toJSON();

      if (!json.name || !/^[a-z0-9_-]{1,32}$/.test(json.name)) {
        logger.warn('deploy-commands', `Nome de comando inválido ignorado: "${json.name}" (${file})`);
        skipped++;
        continue;
      }

      if (seenNames.has(json.name)) {
        logger.warn('deploy-commands', `Comando duplicado ignorado ao registrar: "${json.name}" (${file})`);
        skipped++;
        continue;
      }

      seenNames.add(json.name);
      commandsJson.push(json);
    } catch (err) {
      logger.error('deploy-commands', `Erro ao processar ${path.relative(process.cwd(), file)}: ${err}`);
      skipped++;
    }
  }

  const rest = new REST({ version: '10' }).setToken(token);

  logger.info('deploy-commands', `Registrando ${commandsJson.length} comando(s) no servidor ${guildId}...`);

  try {
    const result = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandsJson,
    })) as unknown[];

    logger.success(
      'deploy-commands',
      `${result.length} comando(s) registrado(s) com sucesso. ${skipped} arquivo(s) ignorado(s)/vazio(s).`
    );
  } catch (err) {
    logger.error('deploy-commands', `Falha ao registrar comandos: ${err}`);
    process.exit(1);
  }
}

main();
