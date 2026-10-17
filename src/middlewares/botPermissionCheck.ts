import { ChatInputCommandInteraction, PermissionResolvable } from 'discord.js';

export async function botPermissionCheckMiddleware(
  interaction: ChatInputCommandInteraction,
  permissions: PermissionResolvable[]
): Promise<boolean> {
  if (!interaction.guild || permissions.length === 0) return true;

  const me = interaction.guild.members.me;
  const missing = me ? permissions.filter((perm) => !me.permissions.has(perm)) : permissions;

  if (missing.length > 0) {
    await interaction.reply({
      content: `Não tenho permissão suficiente para executar essa ação. Preciso de: ${missing.join(', ')}`,
      ephemeral: true,
    });
    return false;
  }

  return true;
}
