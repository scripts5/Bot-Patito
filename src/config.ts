import 'dotenv/config';

interface EnvConfig {
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
  GUILD_ID: string;
  OWNER_ID: string;
  XAI_API_KEY: string | null;
  BOT_NAME: string;
  NODE_ENV: string;
  LOG_LEVEL: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `[config] Variável de ambiente obrigatória ausente: ${name}. Verifique seu arquivo config.env / .env.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

export const config: EnvConfig = {
  DISCORD_TOKEN: required('DISCORD_TOKEN'),
  CLIENT_ID: required('CLIENT_ID'),
  GUILD_ID: required('GUILD_ID'),
  OWNER_ID: required('OWNER_ID'),
  XAI_API_KEY: process.env.XAI_API_KEY && process.env.XAI_API_KEY.trim() !== ''
    ? process.env.XAI_API_KEY
    : null,
  BOT_NAME: optional('BOT_NAME', 'Patito'),
  NODE_ENV: optional('NODE_ENV', 'development'),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
};

export function isOwner(userId: string): boolean {
  return userId === config.OWNER_ID;
}

// Nunca logar/exportar valores sensíveis diretamente.
// Use esta função só para confirmar presença, nunca o valor.
export function maskedStatus() {
  return {
    DISCORD_TOKEN: config.DISCORD_TOKEN ? 'definido' : 'ausente',
    CLIENT_ID: config.CLIENT_ID ? 'definido' : 'ausente',
    GUILD_ID: config.GUILD_ID ? 'definido' : 'ausente',
    OWNER_ID: config.OWNER_ID ? 'definido' : 'ausente',
    XAI_API_KEY: config.XAI_API_KEY ? 'definido' : 'ausente (recursos de IA desativados)',
    BOT_NAME: config.BOT_NAME,
  };
}
