import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('database').setDescription('[DONO] Mostra o status dos arquivos de dados JSON.') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const dataDir = path.resolve(process.cwd(), 'data');
    const files = fs.existsSync(dataDir) ? fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')) : [];

    const summary = files
      .map((f) => {
        const stats = fs.statSync(path.join(dataDir, f));
        return `\`${f}\` — ${(stats.size / 1024).toFixed(1)}KB`;
      })
      .join('\n');

    await interaction.reply({ embeds: [infoEmbed(summary || 'Nenhum arquivo de dados encontrado.', 'Banco de dados (JSON)')], ephemeral: true });
  },
};

export default command;
