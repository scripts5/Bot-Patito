import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Busca a letra da música atual (ou de um termo de busca).')
    .addStringOption((opt) => opt.setName('musica').setDescription('Nome da música (opcional, usa a atual por padrão)')) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);
    const query = interaction.options.getString('musica') ?? queue?.playing?.title;

    if (!query) {
      await interaction.reply({ embeds: [errorEmbed('Nenhuma música tocando e nenhum termo informado.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    try {
      const response = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent('')}/${encodeURIComponent(query)}`);
      // A API lyrics.ovh exige artista/música separados; como só temos o título, tentamos extrair "Artista - Música".
      const parts = query.split('-').map((p) => p.trim());
      const artist = parts.length > 1 ? parts[0] : query;
      const title = parts.length > 1 ? parts.slice(1).join('-').trim() : query;

      const realResponse = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!realResponse.ok) throw new Error('Letra não encontrada.');

      const data = (await realResponse.json()) as { lyrics?: string };
      if (!data.lyrics) throw new Error('Letra não encontrada.');

      const embed = new EmbedBuilder()
        .setColor(colors.primary)
        .setTitle(`🎤 ${query}`)
        .setDescription(data.lyrics.slice(0, 4000));

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.error('lyrics', `Falha ao buscar letra de "${query}": ${err}`);
      await interaction.editReply({ embeds: [errorEmbed(`Não encontrei a letra de "${query}".`)] });
    }
  },
};

export default command;
