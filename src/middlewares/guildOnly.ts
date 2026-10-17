import { ChatInputCommandInteraction } from 'discord.js';

/**
 * Middleware reutilizável: retorna true se a interação pode prosseguir, ou envia
 * uma resposta de erro e retorna false caso o comando exija estar dentro de um servidor.
 * (A verificação principal já roda embutida em src/events/interactionCreate.ts;
 * este módulo existe para reuso em fluxos futuros, como comandos de prefixo ou jobs.)
 */
export async function guildOnlyMiddleware(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (interaction.guild) return true;
  await interaction.reply({ content: 'Esse comando só pode ser usado dentro de um servidor.', ephemeral: true });
  return false;
}
