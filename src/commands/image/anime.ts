import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('anime').setDescription('Mostra uma capa de anime aleatória (via Jikan/MyAnimeList).') as SlashCommandBuilder,
  category: 'image',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const url = await imageApiService.randomAnime();
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(colors.primary).setTitle('🎌 Anime aleatório').setImage(url)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
