import { ChatInputCommandInteraction } from 'discord.js';
import { isOwner } from '../config.js';

export async function ownerOnlyMiddleware(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isOwner(interaction.user.id)) return true;
  await interaction.reply({ content: 'Esse comando é exclusivo do dono do bot.', ephemeral: true });
  return false;
}
