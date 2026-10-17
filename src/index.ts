import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { PatitoClient } from './types/command.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { loadButtons } from './handlers/buttonHandler.js';
import { loadModals } from './handlers/modalHandler.js';
import { loadSelectMenus } from './handlers/selectMenuHandler.js';
import { loadContextMenus } from './handlers/contextMenuHandler.js';
import { startReminderJob } from './jobs/reminderJob.js';
import { startGiveawayJob } from './jobs/giveawayJob.js';
import { startBackupJob } from './jobs/backupJob.js';
import { startCleanupJob } from './jobs/cleanupJob.js';
import { startStatsJob } from './jobs/statsJob.js';

/**
 * GatewayIntentBits mínimos e necessários para as funções do Patito:
 * - Guilds: obrigatório para qualquer interação em servidor.
 * - GuildMembers (PRIVILEGIADO): necessário para boas-vindas, autorole, moderação e busca de membros.
 * - GuildMessages: necessário para automod, sistema de níveis por mensagem e logs de mensagens.
 * - MessageContent (PRIVILEGIADO): necessário para o automod ler o conteúdo das mensagens (anti-spam, anti-link, palavras banidas).
 * - GuildVoiceStates: necessário para o sistema de música e logs de voz.
 * - GuildModeration: necessário para eventos de ban/unban e automod nativo do Discord.
 * - GuildInvites: necessário para rastrear convites usados (opcional, mas usado por /convite e logs).
 *
 * IMPORTANTE: GuildMembers e MessageContent são intents PRIVILEGIADOS.
 * Ative-os manualmente em https://discord.com/developers/applications -> seu app -> Bot -> Privileged Gateway Intents.
 * Sem isso, o login falha ou os eventos relacionados simplesmente não disparam.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildInvites,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
}) as unknown as PatitoClient;

client.commands = new Collection();
client.cooldowns = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.selectMenus = new Collection();

async function bootstrap(): Promise<void> {
  logger.info('index', `Iniciando ${config.BOT_NAME}...`);

  // DISCORD_TOKEN já é validado em config.ts (lança erro e impede o boot se faltar).

  await loadCommands(client);
  await loadContextMenus(client);
  await loadButtons(client);
  await loadModals(client);
  await loadSelectMenus(client);
  await loadEvents(client);

  process.on('unhandledRejection', (reason) => {
    logger.error('process', `Promise rejeitada sem tratamento: ${reason}`);
  });

  process.on('uncaughtException', (err) => {
    logger.error('process', `Exceção não capturada: ${err.message}`);
  });

  try {
    await client.login(config.DISCORD_TOKEN);
  } catch (err) {
    logger.error('index', 'Falha ao autenticar no Discord. Verifique se DISCORD_TOKEN é válido e não expirou.');
    process.exit(1);
  }

  // Jobs de fundo (lembretes, sorteios, backup, limpeza, estatísticas).
  startReminderJob(client);
  startGiveawayJob(client);
  startBackupJob();
  startCleanupJob();
  startStatsJob(client);
}

bootstrap();
