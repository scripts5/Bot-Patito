import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('leaderboard-xp').setDescription('Mostra o ranking de níveis do servidor.') as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const top = levelService.leaderboard(interaction.guild!.id, 10);
    if (top.length === 0) {
      await interaction.reply('Ninguém tem XP registrado ainda.');
      return;
    }
    const description = top.map((a, i) => `**${i + 1}.** <@${a.userId}> — Nível ${a.level} (${a.xp} XP)`).join('\n');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.primary).setTitle('📊 Ranking de Níveis').setDescription(description)] });
  },
};

export default command;
