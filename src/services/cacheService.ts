/**
 * Cache em memória simples com TTL, usado para evitar leituras repetidas de JSON
 * em operações de alta frequência (ex: settings do servidor durante automod).
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export const cacheService = {
  get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.value as T;
  },
  set<T>(key: string, value: T, ttlMs = 60_000): void {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },
  delete(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
};
