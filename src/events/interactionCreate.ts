import { Collection } from 'discord.js';
import { BotEvent } from '../handlers/eventHandler.js';
import { PatitoClient } from '../types/command.js';
import { handleInteractionError, respondWithError } from '../handlers/errorHandler.js';
import { handleAutocomplete } from '../handlers/autocompleteHandler.js';
import { executeButton } from '../handlers/buttonHandler.js';
import { findModal } from '../handlers/modalHandler.js';
import { findSelectMenu } from '../handlers/selectMenuHandler.js';
import { COOLDOWN_DEFAULT_SECONDS } from '../utils/constants.js';
import { isOwner } from '../config.js';

const event: BotEvent<'interactionCreate'> = {
  name: 'interactionCreate',
  async execute(interaction) {
    const client = interaction.client as PatitoClient;

    try {
      // ---- Autocomplete ----
      if (interaction.isAutocomplete()) {
        await handleAutocomplete(client, interaction);
        return;
      }

      // ---- Slash commands ----
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          await interaction.reply({ content: 'Comando desconhecido ou não registrado.', ephemeral: true });
          return;
        }

        if (command.ownerOnly && !isOwner(interaction.user.id)) {
          await interaction.reply({ content: 'Esse comando é exclusivo do dono do bot.', ephemeral: true });
          return;
        }

        if (command.guildOnly && !interaction.guild) {
          await interaction.reply({ content: 'Esse comando só pode ser usado dentro de um servidor.', ephemeral: true });
          return;
        }

        if (command.userPermissions?.length && interaction.guild) {
          const member = await interaction.guild.members.fetch(interaction.user.id);
          const missing = command.userPermissions.filter((perm) => !member.permissions.has(perm));
          if (missing.length > 0) {
            await interaction.reply({
              content: `Você não tem permissão suficiente para usar esse comando. Permissões faltando: ${missing.join(', ')}`,
              ephemeral: true,
            });
            return;
          }
        }

        if (command.botPermissions?.length && interaction.guild) {
          const me = interaction.guild.members.me;
          const missing = me ? command.botPermissions.filter((perm) => !me.permissions.has(perm)) : command.botPermissions;
          if (missing.length > 0) {
            await interaction.reply({
              content: `Não tenho permissão suficiente para executar esse comando. Preciso de: ${missing.join(', ')}`,
              ephemeral: true,
            });
            return;
          }
        }

        // Cooldown
        const cooldownSeconds = command.cooldown ?? COOLDOWN_DEFAULT_SECONDS;
        if (!client.cooldowns.has(command.data.name)) {
          client.cooldowns.set(command.data.name, new Collection());
        }
        const timestamps = client.cooldowns.get(command.data.name)!;
        const now = Date.now();
        const expiration = timestamps.get(interaction.user.id);

        if (expiration && now < expiration) {
          const remaining = ((expiration - now) / 1000).toFixed(1);
          await interaction.reply({
            content: `Aguarde ${remaining}s antes de usar "/${command.data.name}" novamente.`,
            ephemeral: true,
          });
          return;
        }
        timestamps.set(interaction.user.id, now + cooldownSeconds * 1000);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownSeconds * 1000);

        await command.execute(interaction);
        return;
      }

      // ---- Botões ----
      if (interaction.isButton()) {
        const handler = await executeButton(client, interaction.customId);
        if (!handler) {
          await respondWithError(interaction, 'Esse botão não é mais válido ou expirou.');
          return;
        }
        await handler.execute(interaction);
        return;
      }

      // ---- Modais ----
      if (interaction.isModalSubmit()) {
        const handler = findModal(client, interaction.customId);
        if (!handler) {
          await respondWithError(interaction, 'Esse formulário não é mais válido ou expirou.');
          return;
        }
        await handler.execute(interaction);
        return;
      }

      // ---- Menus de seleção ----
      if (interaction.isAnySelectMenu()) {
        const handler = findSelectMenu(client, interaction.customId);
        if (!handler) {
          await respondWithError(interaction, 'Esse menu não é mais válido ou expirou.');
          return;
        }
        await handler.execute(interaction);
        return;
      }

      // Tipo de interação desconhecido/não suportado ainda.
    } catch (err) {
      await handleInteractionError(interaction, err);
    }
  },
};

export default event;
