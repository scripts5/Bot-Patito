import { Client, TextChannel } from 'discord.js';
import { reminderService } from '../services/reminderService.js';
import { moderacaoService } from '../services/moderacaoService.js';
import { logger } from '../utils/logger.js';

/**
 * Roda a cada minuto: dispara lembretes vencidos e processa desbanimentos
 * temporários agendados via /tempban (marcados com prefixo __TEMPBAN_UNDO__).
 */
export function startReminderJob(client: Client): void {
  setInterval(async () => {
    const pending = reminderService.listPending().filter((r) => r.remindAt <= Date.now());

    for (const reminder of pending) {
      try {
        if (reminder.message.startsWith('__TEMPBAN_UNDO__:')) {
          const userId = reminder.message.split(':')[1];
          const guild = client.guilds.cache.get(reminder.guildId ?? '');
          if (guild) {
            const actor = await guild.members.fetchMe();
            await moderacaoService.unban(guild, actor, userId, 'Ban temporário expirado');
          }
        } else {
          const channel = client.channels.cache.get(reminder.channelId) as TextChannel | undefined;
          if (channel) {
            await channel.send(`<@${reminder.userId}> ⏰ Lembrete: ${reminder.message}`);
          }
        }
      } catch (err) {
        logger.error('reminderJob', `Falha ao processar lembrete ${reminder.id}: ${err}`);
      } finally {
        await reminderService.markSent(reminder.id);
      }
    }
  }, 60_000);
}
