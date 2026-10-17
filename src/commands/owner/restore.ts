import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('restore')
    .setDescription('[DONO] Restaura um arquivo de dados a partir de um backup específico.')
    .addStringOption((opt) => opt.setName('nome_backup').setDescription('Nome do arquivo em /backups, ex: warnings-1699999999.json').setRequired(true)) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const backupName = interaction.options.getString('nome_backup', true);
    const backupPath = path.resolve(process.cwd(), 'backups', backupName);

    if (!fs.existsSync(backupPath) || !backupName.endsWith('.json')) {
      await interaction.reply({ embeds: [errorEmbed('Backup não encontrado. Confira o nome exato do arquivo.')], ephemeral: true });
      return;
    }

    const originalName = backupName.replace(/-\d+\.json$/, '.json');
    const targetPath = path.resolve(process.cwd(), 'data', originalName);

    fs.copyFileSync(backupPath, targetPath);

    await interaction.reply({ embeds: [successEmbed(`Restaurado: ${originalName} a partir de ${backupName}. Reinicie o bot para garantir consistência.`)], ephemeral: true });
  },
};

export default command;
