import { AnySelectMenuInteraction } from 'discord.js';

export interface SelectMenuHandlerModule {
  customId: string | RegExp;
  execute: (interaction: AnySelectMenuInteraction) => Promise<void>;
}
