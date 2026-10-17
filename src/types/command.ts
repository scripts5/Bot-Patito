import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  SlashCommandOptionsOnlyBuilder,
  PermissionResolvable,
  AutocompleteInteraction,
} from 'discord.js';
import { ButtonHandlerModule } from './button.js';
import { ModalHandlerModule } from './modal.js';
import { SelectMenuHandlerModule } from './selectMenu.js';

export type SlashCommandData =
  | SlashCommandBuilder
  | SlashCommandSubcommandsOnlyBuilder
  | SlashCommandOptionsOnlyBuilder
  | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

export interface Command {
  data: SlashCommandData;
  category?: string;
  cooldown?: number; // segundos
  ownerOnly?: boolean;
  guildOnly?: boolean;
  userPermissions?: PermissionResolvable[];
  botPermissions?: PermissionResolvable[];
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

/**
 * Cliente do Discord estendido com as coleções internas do Patito.
 * Usado em todos os handlers para carregar/executar comandos, botões, modais, menus etc.
 */
export interface PatitoClient extends Client {
  commands: Collection<string, Command>;
  cooldowns: Collection<string, Collection<string, number>>;
  buttons: Collection<string | RegExp, ButtonHandlerModule>;
  modals: Collection<string | RegExp, ModalHandlerModule>;
  selectMenus: Collection<string | RegExp, SelectMenuHandlerModule>;
}
