import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { backupService } from '../../services/backupService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('backup').setDescription('[DONO] Força um backup manual de todos os dados.') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const count = backupService.runFullBackup();
    await interaction.editReply({ embeds: [successEmbed(`Backup concluído: ${count} arquivo(s) salvos em /backups.`)] });
  },
};

export default command;
