import { GuildMember, PermissionResolvable, PermissionsBitField } from 'discord.js';

export function hasPermission(member: GuildMember, permission: PermissionResolvable): boolean {
  return member.permissions.has(permission);
}

export function missingPermissions(
  member: GuildMember,
  required: PermissionResolvable[]
): string[] {
  const missing = new PermissionsBitField(required).remove(member.permissions);
  return missing.toArray();
}

/**
 * Verifica se o "actor" pode moderar o "target" com base na hierarquia de cargos.
 * Retorna null se puder, ou uma string com o motivo do bloqueio.
 */
export function canModerate(
  actor: GuildMember,
  target: GuildMember,
  ownerId: string
): string | null {
  if (target.id === ownerId) return 'Não é possível moderar o dono do bot.';
  if (target.id === target.guild.ownerId) return 'Não é possível moderar o dono do servidor.';
  if (target.id === target.client.user?.id) return 'Não é possível moderar o próprio bot.';
  if (target.roles.highest.position >= actor.roles.highest.position && actor.id !== actor.guild.ownerId) {
    return 'Você não pode moderar alguém com cargo igual ou superior ao seu.';
  }
  if (!target.moderatable) return 'Não tenho permissão para moderar esse membro (hierarquia de cargos).';
  return null;
}
