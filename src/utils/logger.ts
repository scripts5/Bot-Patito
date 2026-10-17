import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

type Level = 'info' | 'warn' | 'error' | 'debug' | 'success';

const COLORS: Record<Level, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[90m',
  success: '\x1b[32m',
};
const RESET = '\x1b[0m';

// Palavras/padrões que nunca devem ir para o console ou arquivo de log.
const SECRET_PATTERNS = [/discord_token/i, /xai_api_key/i, /bot token/i, /bearer\s+[a-z0-9._-]+/i];

function sanitize(message: string): string {
  let safe = message;
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(safe)) {
      safe = safe.replace(pattern, '[REDACTED]');
    }
  }
  return safe;
}

function writeToFile(fileName: string, line: string) {
  try {
    fs.appendFileSync(path.join(LOG_DIR, fileName), line + '\n', 'utf-8');
  } catch {
    // Se o log em arquivo falhar, não derruba o bot.
  }
}

function base(level: Level, scope: string, message: string, fileName = 'errors.log') {
  const safeMessage = sanitize(message);
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${safeMessage}`;
  console.log(`${COLORS[level]}${line}${RESET}`);
  if (level === 'error' || level === 'warn') {
    writeToFile(fileName, line);
  }
}

export const logger = {
  info: (scope: string, message: string) => base('info', scope, message),
  success: (scope: string, message: string) => base('success', scope, message),
  warn: (scope: string, message: string) => base('warn', scope, message),
  error: (scope: string, message: string) => base('error', scope, message, 'errors.log'),
  debug: (scope: string, message: string) => {
    if (process.env.DEBUG === 'true') base('debug', scope, message);
  },
  moderation: (message: string) => {
    const line = `[${new Date().toISOString()}] ${sanitize(message)}`;
    writeToFile('moderation.log', line);
  },
  member: (message: string) => {
    const line = `[${new Date().toISOString()}] ${sanitize(message)}`;
    writeToFile('members.log', line);
  },
  voice: (message: string) => {
    const line = `[${new Date().toISOString()}] ${sanitize(message)}`;
    writeToFile('voice.log', line);
  },
  messageLog: (message: string) => {
    const line = `[${new Date().toISOString()}] ${sanitize(message)}`;
    writeToFile('messages.log', line);
  },
};
