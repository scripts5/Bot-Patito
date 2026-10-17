import {
  BaseInteraction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  AnySelectMenuInteraction,
} from 'discord.js';
import { logger } from '../utils/logger.js';
import { errorEmbed } from '../utils/embedUtils.js';

type InteractionWithReply =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | ModalSubmitInteraction
  | AnySelectMenuInteraction;

/**
 * Responde a uma interação com uma mensagem de erro, sem nunca tentar responder duas vezes
 * (usa reply, editReply ou followUp dependendo do estado atual da interação).
 */
export async function respondWithError(interaction: InteractionWithReply, message: string): Promise<void> {
  const embed = errorEmbed(message);

  try {
    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply({ embeds: [embed] });
    } else if (interaction.replied) {
      await interaction.followUp({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  } catch (err) {
    logger.error('errorHandler', `Falha ao responder com mensagem de erro: ${err}`);
  }
}

export async function handleInteractionError(interaction: BaseInteraction, error: unknown): Promise<void> {
  const context = interaction.isChatInputCommand()
    ? `comando "${interaction.commandName}"`
    : 'interação';

  const message = error instanceof Error ? error.message : String(error);
  logger.error('errorHandler', `Erro em ${context}: ${message}`);

  if (
    interaction.isChatInputCommand() ||
    interaction.isButton() ||
    interaction.isModalSubmit() ||
    interaction.isAnySelectMenu()
  ) {
    await respondWithError(interaction, 'Ocorreu um erro ao processar essa ação. Já foi registrado nos logs.');
  }
}
