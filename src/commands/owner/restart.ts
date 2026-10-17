import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('restart').setDescription('[DONO] Reinicia o processo do bot.') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: '🔄 Reiniciando o bot...', ephemeral: true });
    logger.warn('restart', `Reinício solicitado por ${interaction.user.tag}.`);
    process.exit(0); // Requer um gerenciador de processo (pm2, systemd, etc.) para reiniciar automaticamente.
  },
};

export default command;
