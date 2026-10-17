import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('meme').setDescription('Mostra um meme aleatório para dar risada.') as SlashCommandBuilder,
  category: 'fun',
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const meme = await imageApiService.randomMeme();
      await interaction.editReply({
        embeds: [new EmbedBuilder().setColor(colors.primary).setTitle(meme.title).setImage(meme.url).setFooter({ text: `r/${meme.subreddit}` })],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
