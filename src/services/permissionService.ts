import { GuildMember, PermissionResolvable } from 'discord.js';
import { hasPermission, missingPermissions, canModerate } from '../utils/permissionUtils.js';
import { isOwner } from '../config.js';

export const permissionService = {
  hasAll(member: GuildMember, permissions: PermissionResolvable[]): boolean {
    return permissions.every((p) => hasPermission(member, p));
  },
  missing(member: GuildMember, permissions: PermissionResolvable[]): string[] {
    return missingPermissions(member, permissions);
  },
  canModerate,
  isOwner,
};
