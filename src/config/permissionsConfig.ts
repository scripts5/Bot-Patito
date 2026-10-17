import { PermissionFlagsBits } from 'discord.js';

export const permissionsConfig = {
  ban: [PermissionFlagsBits.BanMembers],
  kick: [PermissionFlagsBits.KickMembers],
  moderate: [PermissionFlagsBits.ModerateMembers],
  manageMessages: [PermissionFlagsBits.ManageMessages],
  manageChannels: [PermissionFlagsBits.ManageChannels],
  manageRoles: [PermissionFlagsBits.ManageRoles],
  manageGuild: [PermissionFlagsBits.ManageGuild],
  moveMembers: [PermissionFlagsBits.MoveMembers],
  deafenMembers: [PermissionFlagsBits.DeafenMembers],
  administrator: [PermissionFlagsBits.Administrator],
} as const;
