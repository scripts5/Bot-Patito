import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('manga').setDescription('Mostra um mangá aleatório (via Jikan/MyAnimeList).') as SlashCommandBuilder,
  category: 'image',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const manga = await imageApiService.randomManga();
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(colors.primary).setTitle(manga.title).setURL(manga.url).setImage(manga.image)],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
