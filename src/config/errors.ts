export const errorCodes = {
  MISSING_PERMISSIONS: 'MISSING_PERMISSIONS',
  MISSING_BOT_PERMISSIONS: 'MISSING_BOT_PERMISSIONS',
  INVALID_TARGET: 'INVALID_TARGET',
  HIERARCHY_ERROR: 'HIERARCHY_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN',
} as const;

export class BotError extends Error {
  code: string;
  constructor(code: keyof typeof errorCodes, message: string) {
    super(message);
    this.code = code;
    this.name = 'BotError';
  }
}
