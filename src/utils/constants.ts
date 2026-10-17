export const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  warning: 0xfee75c,
  error: 0xed4245,
  info: 0x5dadec,
  neutral: 0x2b2d31,
} as const;

export const EMOJIS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  loading: '⏳',
  info: 'ℹ️',
  arrow: '➜',
} as const;

export const COOLDOWN_DEFAULT_SECONDS = 3;
export const MAX_EMBED_FIELDS = 25;
export const MAX_EMBED_DESCRIPTION = 4096;
