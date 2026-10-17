import { economyRepository } from '../database/repositories/economyRepository.js';
import { botConfig } from '../config/botConfig.js';
import { randomInt } from '../utils/mathUtils.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'vip', name: 'Cargo VIP (cosmético)', price: 5000, emoji: '💎' },
  { id: 'trophy', name: 'Troféu', price: 1000, emoji: '🏆' },
  { id: 'shield', name: 'Escudo Protetor', price: 2500, emoji: '🛡️' },
  { id: 'ring', name: 'Anel de Ouro', price: 750, emoji: '💍' },
  { id: 'crown', name: 'Coroa', price: 10000, emoji: '👑' },
];

export const economyService = {
  getBalance(guildId: string, userId: string) {
    return economyRepository.get(guildId, userId);
  },

  leaderboard(guildId: string, limit = 10) {
    return economyRepository.leaderboard(guildId, limit);
  },

  async daily(guildId: string, userId: string): Promise<{ ok: boolean; message: string; amount?: number }> {
    const account = economyRepository.get(guildId, userId);
    const now = Date.now();

    if (account.lastDaily && now - account.lastDaily < DAY_MS) {
      const remaining = DAY_MS - (now - account.lastDaily);
      const hours = Math.ceil(remaining / (60 * 60 * 1000));
      return { ok: false, message: `Você já resgatou hoje. Tente novamente em ~${hours}h.` };
    }

    await economyRepository.update(guildId, userId, {
      balance: account.balance + botConfig.economy.dailyAmount,
      lastDaily: now,
    });

    return { ok: true, message: 'Recompensa diária resgatada!', amount: botConfig.economy.dailyAmount };
  },

  async work(guildId: string, userId: string): Promise<{ ok: boolean; message: string; amount?: number }> {
    const account = economyRepository.get(guildId, userId);
    const now = Date.now();

    if (account.lastWork && now - account.lastWork < botConfig.economy.workCooldownMs) {
      const remaining = botConfig.economy.workCooldownMs - (now - account.lastWork);
      const minutes = Math.ceil(remaining / 60_000);
      return { ok: false, message: `Você já trabalhou recentemente. Tente novamente em ~${minutes}min.` };
    }

    const amount = randomInt(botConfig.economy.workMinAmount, botConfig.economy.workMaxAmount);
    await economyRepository.update(guildId, userId, { balance: account.balance + amount, lastWork: now });

    return { ok: true, message: 'Você trabalhou e ganhou uma recompensa!', amount };
  },

  async transfer(guildId: string, fromId: string, toId: string, amount: number): Promise<{ ok: boolean; message: string }> {
    if (amount <= 0) return { ok: false, message: 'Valor inválido.' };
    const from = economyRepository.get(guildId, fromId);
    if (from.balance < amount) return { ok: false, message: 'Saldo insuficiente.' };

    await economyRepository.update(guildId, fromId, { balance: from.balance - amount });
    const to = economyRepository.get(guildId, toId);
    await economyRepository.update(guildId, toId, { balance: to.balance + amount });

    return { ok: true, message: `Transferência de ${amount} concluída.` };
  },

  async bet(guildId: string, userId: string, amount: number): Promise<{ ok: boolean; message: string; won: boolean; amount: number }> {
    const account = economyRepository.get(guildId, userId);
    if (amount <= 0 || amount > account.balance) {
      return { ok: false, message: 'Valor de aposta inválido ou saldo insuficiente.', won: false, amount: 0 };
    }

    const won = Math.random() < 0.45;
    const delta = won ? amount : -amount;
    await economyRepository.update(guildId, userId, { balance: account.balance + delta });

    return { ok: true, message: won ? 'Você ganhou a aposta!' : 'Você perdeu a aposta.', won, amount: Math.abs(delta) };
  },

  async weekly(guildId: string, userId: string): Promise<{ ok: boolean; message: string; amount?: number }> {
    const account = economyRepository.get(guildId, userId);
    const now = Date.now();
    const WEEK_MS = 7 * DAY_MS;

    if (account.lastWeekly && now - account.lastWeekly < WEEK_MS) {
      const remainingDays = Math.ceil((WEEK_MS - (now - account.lastWeekly)) / DAY_MS);
      return { ok: false, message: `Você já resgatou essa semana. Tente novamente em ~${remainingDays} dia(s).` };
    }

    const amount = botConfig.economy.dailyAmount * 5;
    await economyRepository.update(guildId, userId, { balance: account.balance + amount, lastWeekly: now });
    return { ok: true, message: 'Recompensa semanal resgatada!', amount };
  },

  async monthly(guildId: string, userId: string): Promise<{ ok: boolean; message: string; amount?: number }> {
    const account = economyRepository.get(guildId, userId);
    const now = Date.now();
    const MONTH_MS = 30 * DAY_MS;

    if (account.lastMonthly && now - account.lastMonthly < MONTH_MS) {
      const remainingDays = Math.ceil((MONTH_MS - (now - account.lastMonthly)) / DAY_MS);
      return { ok: false, message: `Você já resgatou esse mês. Tente novamente em ~${remainingDays} dia(s).` };
    }

    const amount = botConfig.economy.dailyAmount * 20;
    await economyRepository.update(guildId, userId, { balance: account.balance + amount, lastMonthly: now });
    return { ok: true, message: 'Recompensa mensal resgatada!', amount };
  },

  async deposit(guildId: string, userId: string, amount: number): Promise<{ ok: boolean; message: string }> {
    const account = economyRepository.get(guildId, userId);
    if (amount <= 0 || amount > account.balance) return { ok: false, message: 'Valor inválido ou saldo insuficiente na carteira.' };
    await economyRepository.update(guildId, userId, { balance: account.balance - amount, bank: account.bank + amount });
    return { ok: true, message: `Depositado ${amount} no banco.` };
  },

  async withdraw(guildId: string, userId: string, amount: number): Promise<{ ok: boolean; message: string }> {
    const account = economyRepository.get(guildId, userId);
    if (amount <= 0 || amount > account.bank) return { ok: false, message: 'Valor inválido ou saldo insuficiente no banco.' };
    await economyRepository.update(guildId, userId, { balance: account.balance + amount, bank: account.bank - amount });
    return { ok: true, message: `Sacado ${amount} do banco.` };
  },

  async rob(guildId: string, robberId: string, victimId: string): Promise<{ ok: boolean; message: string; amount?: number }> {
    if (robberId === victimId) return { ok: false, message: 'Você não pode roubar a si mesmo.' };

    const victim = economyRepository.get(guildId, victimId);
    if (victim.balance < 100) return { ok: false, message: 'Essa pessoa não tem dinheiro suficiente na carteira para valer o risco.' };

    const success = Math.random() < 0.4;
    if (!success) {
      const robber = economyRepository.get(guildId, robberId);
      const fine = Math.min(robber.balance, 50);
      await economyRepository.update(guildId, robberId, { balance: robber.balance - fine });
      return { ok: false, message: `Você foi pego! Pagou uma multa de ${fine}.` };
    }

    const stolen = Math.floor(victim.balance * (0.1 + Math.random() * 0.2));
    await economyRepository.update(guildId, victimId, { balance: victim.balance - stolen });
    const robber = economyRepository.get(guildId, robberId);
    await economyRepository.update(guildId, robberId, { balance: robber.balance + stolen });

    return { ok: true, message: `Você roubou ${stolen} de <@${victimId}>!`, amount: stolen };
  },

  async slots(guildId: string, userId: string, amount: number): Promise<{ ok: boolean; message: string; won: boolean; symbols: string[]; amount: number }> {
    const account = economyRepository.get(guildId, userId);
    if (amount <= 0 || amount > account.balance) {
      return { ok: false, message: 'Valor inválido ou saldo insuficiente.', won: false, symbols: [], amount: 0 };
    }

    const symbolPool = ['🍒', '🍋', '🍊', '⭐', '💎', '7️⃣'];
    const spin = [randomInt(0, symbolPool.length - 1), randomInt(0, symbolPool.length - 1), randomInt(0, symbolPool.length - 1)].map(
      (i) => symbolPool[i]
    );
    const won = spin[0] === spin[1] && spin[1] === spin[2];
    const delta = won ? amount * 3 : -amount;

    await economyRepository.update(guildId, userId, { balance: account.balance + delta });

    return { ok: true, message: won ? 'Combinação perfeita! Você ganhou!' : 'Não foi dessa vez.', won, symbols: spin, amount: Math.abs(delta) };
  },

  async buyItem(guildId: string, userId: string, itemId: string): Promise<{ ok: boolean; message: string }> {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { ok: false, message: 'Item não encontrado na loja.' };

    const account = economyRepository.get(guildId, userId);
    if (account.balance < item.price) return { ok: false, message: 'Saldo insuficiente para comprar esse item.' };

    const inventory = { ...account.inventory, [item.id]: (account.inventory[item.id] ?? 0) + 1 };
    await economyRepository.update(guildId, userId, { balance: account.balance - item.price, inventory });

    return { ok: true, message: `Você comprou ${item.emoji} ${item.name}!` };
  },

  async sellItem(guildId: string, userId: string, itemId: string): Promise<{ ok: boolean; message: string }> {
    const item = SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { ok: false, message: 'Item não encontrado.' };

    const account = economyRepository.get(guildId, userId);
    const owned = account.inventory[item.id] ?? 0;
    if (owned <= 0) return { ok: false, message: 'Você não possui esse item.' };

    const sellPrice = Math.floor(item.price * 0.5);
    const inventory = { ...account.inventory, [item.id]: owned - 1 };
    await economyRepository.update(guildId, userId, { balance: account.balance + sellPrice, inventory });

    return { ok: true, message: `Você vendeu ${item.emoji} ${item.name} por ${sellPrice}.` };
  },
};
