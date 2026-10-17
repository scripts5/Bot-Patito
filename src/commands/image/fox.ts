import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('fox').setDescription('Mostra uma imagem aleatória de raposa.') as SlashCommandBuilder,
  category: 'image',
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    try {
      const url = await imageApiService.randomFox();
      await interaction.editReply({ embeds: [new EmbedBuilder().setColor(colors.primary).setTitle('🦊 Raposa!').setImage(url)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
