export const apis = {
  xai: {
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-beta',
    timeoutMs: 20_000,
    maxCharsPerRequest: 4000,
  },
} as const;
