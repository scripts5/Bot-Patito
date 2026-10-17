import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

export async function permissionCheckMiddleware(
  interaction: ChatInputCommandInteraction,
  permissions: PermissionResolvable[]
): Promise<boolean> {
  if (!interaction.guild || permissions.length === 0) return true;

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const missing = permissions.filter((perm) => !member.permissions.has(perm));

  if (missing.length > 0) {
    await interaction.reply({
      content: `Você não tem permissão suficiente. Faltando: ${missing.join(', ')}`,
      ephemeral: true,
    });
    return false;
  }

  return true;
}
