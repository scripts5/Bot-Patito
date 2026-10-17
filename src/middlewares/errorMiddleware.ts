import { logger } from '../utils/logger.js';

export function withErrorHandling<T extends unknown[]>(
  scope: string,
  fn: (...args: T) => Promise<void>
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (err) {
      logger.error(scope, `Erro não tratado: ${err}`);
    }
  };
}
