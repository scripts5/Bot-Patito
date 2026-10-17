export const botConfig = {
  defaultCooldownSeconds: 3,
  maxWarningsBeforeAutoban: 5,
  ticketsPerUserLimit: 2,
  economy: {
    dailyAmount: 100,
    workMinAmount: 20,
    workMaxAmount: 80,
    workCooldownMs: 60 * 60 * 1000,
    shopItems: [
      { id: 'vip', name: '🎟️ Cargo VIP', price: 5000 },
      { id: 'trofeu', name: '🏆 Troféu de destaque', price: 1500 },
      { id: 'escudo', name: '🛡️ Escudo anti-roubo (24h)', price: 800 },
      { id: 'sorte', name: '🍀 Amuleto da sorte (+10% em apostas por 24h)', price: 1200 },
    ] as { id: string; name: string; price: number }[],
  },
  levels: {
    xpPerMessageMin: 5,
    xpPerMessageMax: 15,
    messageCooldownMs: 60 * 1000,
  },
} as const;
