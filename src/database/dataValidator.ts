/**
 * Validador leve de estruturas de dados JSON, usado pelos repositories antes de gravar.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArrayOf<T>(value: unknown, check: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(check);
}

export function hasStringField(obj: Record<string, unknown>, field: string): boolean {
  return typeof obj[field] === 'string' && obj[field] !== '';
}

export function hasNumberField(obj: Record<string, unknown>, field: string): boolean {
  return typeof obj[field] === 'number' && !Number.isNaN(obj[field]);
}

export function validateOrThrow(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[dataValidator] ${message}`);
}
