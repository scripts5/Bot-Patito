import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from '../../types/command.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('[DONO] Baixa um arquivo de log específico.')
    .addStringOption((opt) =>
      opt
        .setName('arquivo')
        .setDescription('Qual log')
        .setRequired(true)
        .addChoices(
          { name: 'errors.log', value: 'errors.log' },
          { name: 'moderation.log', value: 'moderation.log' },
          { name: 'messages.log', value: 'messages.log' },
          { name: 'members.log', value: 'members.log' },
          { name: 'voice.log', value: 'voice.log' }
        )
    ) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const file = interaction.options.getString('arquivo', true);
    const filePath = path.resolve(process.cwd(), 'logs', file);

    if (!fs.existsSync(filePath)) {
      await interaction.reply({ embeds: [errorEmbed('Esse arquivo de log ainda não existe (nenhum evento registrado).')], ephemeral: true });
      return;
    }

    await interaction.reply({ files: [new AttachmentBuilder(filePath)], ephemeral: true });
  },
};

export default command;
