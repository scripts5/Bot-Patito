import { Collection } from 'discord.js';

const cooldowns = new Collection<string, Collection<string, number>>();

export function checkCooldown(commandName: string, userId: string, seconds: number): number {
  if (!cooldowns.has(commandName)) cooldowns.set(commandName, new Collection());
  const timestamps = cooldowns.get(commandName)!;
  const now = Date.now();
  const expiration = timestamps.get(userId);

  if (expiration && now < expiration) {
    return expiration - now;
  }

  timestamps.set(userId, now + seconds * 1000);
  setTimeout(() => timestamps.delete(userId), seconds * 1000);
  return 0;
}
