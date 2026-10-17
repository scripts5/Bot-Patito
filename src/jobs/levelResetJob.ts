import { logger } from '../utils/logger.js';

/**
 * Job de infraestrutura para resets programados de nível (ex: temporada mensal).
 * Fica inativo por padrão — ative chamando startLevelResetJob(guildIds) manualmente
 * caso o servidor deseje resets automáticos periódicos.
 */
export function startLevelResetJob(intervalMs: number, onReset: () => Promise<void>): void {
  setInterval(async () => {
    try {
      await onReset();
      logger.info('levelResetJob', 'Reset de níveis executado.');
    } catch (err) {
      logger.error('levelResetJob', `Falha no reset de níveis: ${err}`);
    }
  }, intervalMs);
}
