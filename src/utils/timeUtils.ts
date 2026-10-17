const UNITS: Record<string, number> = {
  s: 1000,
  sec: 1000,
  segundo: 1000,
  segundos: 1000,
  m: 60_000,
  min: 60_000,
  minuto: 60_000,
  minutos: 60_000,
  h: 3_600_000,
  hora: 3_600_000,
  horas: 3_600_000,
  d: 86_400_000,
  dia: 86_400_000,
  dias: 86_400_000,
};

/**
 * Converte strings como "10m", "2h", "1d" em milissegundos.
 * Retorna null se o formato não for reconhecido.
 */
export function parseDuration(input: string): number | null {
  const match = input.trim().toLowerCase().match(/^(\d+)\s*([a-zçã]+)$/i);
  if (!match) return null;
  const [, amountStr, unitRaw] = match;
  const amount = Number(amountStr);
  const unit = UNITS[unitRaw];
  if (!unit || Number.isNaN(amount)) return null;
  return amount * unit;
}

export function msToHuman(ms: number): string {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60_000) % 60;
  const hours = Math.floor(ms / 3_600_000) % 24;
  const days = Math.floor(ms / 86_400_000);

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function formatTimestamp(ms: number, style: 'R' | 'F' | 'D' | 'T' = 'R'): string {
  return `<t:${Math.floor(ms / 1000)}:${style}>`;
}
