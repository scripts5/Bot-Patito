/**
 * Bots públicos conhecidos e as funções que costumam cobrir.
 * Usado na auto-configuração: se um bot já cobre uma função, o Patito evita
 * duplicar aquilo (boas-vindas repetida, XP duplicado, etc).
 * Um bot não reconhecido nessa lista simplesmente não desliga nada do Patito.
 */
export interface KnownBot {
  pattern: RegExp;
  features: string[];
}

export const knownBots: KnownBot[] = [
  { pattern: /^mee6$/i, features: ['moderation', 'leveling', 'welcome', 'automod'] },
  { pattern: /^dyno$/i, features: ['moderation', 'automod', 'welcome', 'music'] },
  { pattern: /^carl-?bot$/i, features: ['moderation', 'automod', 'reaction-roles'] },
  { pattern: /^probot$/i, features: ['moderation', 'welcome', 'leveling', 'automod'] },
  { pattern: /^arcane$/i, features: ['leveling', 'welcome'] },
  { pattern: /^amari ?bot$/i, features: ['leveling'] },
  { pattern: /^(ticket ?tool|tickets ?bot|ticketsbot)$/i, features: ['tickets'] },
  { pattern: /^(jockie ?music|hydra|octave|fredboat|rythm|groovy|chip|vexera)$/i, features: ['music'] },
  { pattern: /^(giveawaybot|giveaway ?boat)$/i, features: ['giveaways'] },
  { pattern: /^yagpdb(\.xyz)?$/i, features: ['moderation', 'automod', 'leveling', 'reaction-roles'] },
  { pattern: /^(reaction ?roles?|role ?bot)$/i, features: ['reaction-roles'] },
  { pattern: /^(unbelieva ?boat|idle-?miner|coinbot)$/i, features: ['economy'] },
  { pattern: /^wick$/i, features: ['moderation', 'automod'] },
  { pattern: /^security$/i, features: ['moderation', 'automod'] },
];

export function matchKnownBot(username: string): string[] {
  const match = knownBots.find((b) => b.pattern.test(username.trim()));
  return match?.features ?? [];
}
