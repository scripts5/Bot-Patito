import { ButtonInteraction } from 'discord.js';

export interface ButtonHandlerModule {
  customId: string | RegExp;
  execute: (interaction: ButtonInteraction) => Promise<void>;
}
