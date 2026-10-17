export function now(): number {
  return Date.now();
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function isPast(timestamp: number): boolean {
  return timestamp <= Date.now();
}

export function formatDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
