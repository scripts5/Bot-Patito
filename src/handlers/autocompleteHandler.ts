import { AutocompleteInteraction } from 'discord.js';
import { logger } from '../utils/logger.js';
import { PatitoClient } from '../types/command.js';

export async function handleAutocomplete(client: PatitoClient, interaction: AutocompleteInteraction): Promise<void> {
  const command = client.commands.get(interaction.commandName);

  if (!command || typeof command.autocomplete !== 'function') {
    return;
  }

  try {
    await command.autocomplete(interaction);
  } catch (err) {
    logger.error('autocompleteHandler', `Erro no autocomplete de "${interaction.commandName}": ${err}`);
  }
}
