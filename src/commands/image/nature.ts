import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageApiService } from '../../services/imageApiService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('nature').setDescription('Mostra uma foto aleatória de natureza.') as SlashCommandBuilder,
  category: 'image',
  cooldown: 3,
  async execute(interaction: ChatInputCommandInteraction) {
    const url = imageApiService.randomNature();
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.primary).setTitle('🌿 Natureza').setImage(url)] });
  },
};

export default command;
