import { Message } from 'discord.js';
import { serverConfigService } from './serverConfigService.js';
import { INVITE_LINK_REGEX, URL_REGEX } from '../utils/regex.js';
import { logger } from '../utils/logger.js';

interface SpamTracker {
  count: number;
  resetAt: number;
}

const spamMap = new Map<string, SpamTracker>();
const SPAM_WINDOW_MS = 5000;
const SPAM_THRESHOLD = 5;

export const automodService = {
  /**
   * Retorna um motivo de violação se a mensagem infringir alguma regra ativa, ou null se estiver ok.
   */
  async check(message: Message): Promise<string | null> {
    if (!message.guild || message.author.bot) return null;
    const settings = serverConfigService.getSettings(message.guild.id);
    const content = message.content;

    if (settings.automod.antiInvites && INVITE_LINK_REGEX.test(content)) {
      return 'Link de convite do Discord não permitido.';
    }

    if (settings.automod.antiLinks && URL_REGEX.test(content)) {
      return 'Links não são permitidos nesse servidor.';
    }

    if (settings.automod.antiCaps && content.length > 10) {
      const upperRatio = (content.match(/[A-Z]/g)?.length ?? 0) / content.length;
      if (upperRatio > 0.7) return 'Excesso de letras maiúsculas (caps lock).';
    }

    if (settings.automod.bannedWords.length > 0) {
      const lower = content.toLowerCase();
      const found = settings.automod.bannedWords.find((word) => lower.includes(word.toLowerCase()));
      if (found) return 'Mensagem contém uma palavra banida.';
    }

    if (settings.automod.antiSpam) {
      const key = `${message.guild.id}:${message.author.id}`;
      const tracker = spamMap.get(key);
      const now = Date.now();

      if (!tracker || now > tracker.resetAt) {
        spamMap.set(key, { count: 1, resetAt: now + SPAM_WINDOW_MS });
      } else {
        tracker.count++;
        if (tracker.count >= SPAM_THRESHOLD) {
          spamMap.delete(key);
          return 'Envio de mensagens em excesso (spam).';
        }
      }
    }

    return null;
  },

  async enforce(message: Message, reason: string): Promise<void> {
    try {
      await message.delete();
      logger.moderation(`automod guild=${message.guild?.id} user=${message.author.id} reason="${reason}"`);
    } catch (err) {
      logger.error('automodService', `Falha ao apagar mensagem: ${err}`);
    }
  },
};
