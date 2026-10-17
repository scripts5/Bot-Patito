import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('shutdown').setDescription('[DONO] Desliga o bot completamente.') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: '🛑 Desligando o bot...', ephemeral: true });
    logger.warn('shutdown', `Desligamento solicitado por ${interaction.user.tag}.`);
    process.exit(0);
  },
};

export default command;
