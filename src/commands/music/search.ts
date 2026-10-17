import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Busca músicas no YouTube e mostra os 5 primeiros resultados.')
    .addStringOption((opt) => opt.setName('busca').setDescription('Termo de busca').setRequired(true)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString('busca', true);
    await interaction.deferReply();

    try {
      const playDl = await import('play-dl');
      const results = await playDl.search(query, { limit: 5, source: { youtube: 'video' } });

      if (results.length === 0) {
        await interaction.editReply({ embeds: [errorEmbed('Nenhum resultado encontrado.')] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle(`🔎 Resultados para "${query}"`)
        .setDescription(results.map((r, i) => `${i + 1}. [${r.title}](${r.url})`).join('\n'))
        .setFooter({ text: 'Use /play com o link ou nome exato para tocar.' });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('search', `Falha na busca: ${err}`);
      await interaction.editReply({ embeds: [errorEmbed('Falha ao buscar músicas.')] });
    }
  },
};

export default command;
