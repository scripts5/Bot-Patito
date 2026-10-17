import { Guild, GuildMember, User } from 'discord.js';

export async function safeFetchMember(guild: Guild, userId: string): Promise<GuildMember | null> {
  try {
    return await guild.members.fetch(userId);
  } catch {
    return null;
  }
}

export async function safeFetchUser(client: import('discord.js').Client, userId: string): Promise<User | null> {
  try {
    return await client.users.fetch(userId);
  } catch {
    return null;
  }
}

export function displayName(member: GuildMember | User): string {
  return 'displayName' in member ? member.displayName : member.username;
}
