import { ModalSubmitInteraction } from 'discord.js';

export interface ModalHandlerModule {
  customId: string | RegExp;
  execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}
