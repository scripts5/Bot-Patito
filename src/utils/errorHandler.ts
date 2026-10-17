import { logger } from './logger.js';

/**
 * Utilitário genérico de tratamento de erro (não confundir com src/handlers/errorHandler.ts,
 * que trata especificamente erros de interações do Discord).
 */
export function reportError(scope: string, error: unknown): void {
  const message = error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
  logger.error(scope, message);
}

export function toSafeMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Ocorreu um erro inesperado.';
}
