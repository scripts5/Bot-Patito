import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('wall').setDescription('Mostra um wallpaper aleatório.') as SlashCommandBuilder,
  category: 'image',
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    const url = imageApiService.randomWallpaper();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.primary).setTitle('🖼️ Wallpaper').setImage(url)] });
  },
};

export default command;
