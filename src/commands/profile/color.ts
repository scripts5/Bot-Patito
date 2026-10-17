import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isValidHexColor } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('color')
    .setDescription('Define a cor de destaque do seu perfil.')
    .addStringOption((opt) => opt.setName('hex').setDescription('Cor em hexadecimal, ex: #5865F2').setRequired(true)) as SlashCommandBuilder,
  category: 'profile',
  async execute(interaction: ChatInputCommandInteraction) {
    const hex = interaction.options.getString('hex', true);
    if (!isValidHexColor(hex)) {
      await interaction.reply({ embeds: [errorEmbed('Cor inválida. Use o formato #RRGGBB.')], ephemeral: true });
      return;
    }
    await userRepository.update(interaction.user.id, { color: hex });
    await interaction.reply({ embeds: [successEmbed('Cor do perfil atualizada!')], ephemeral: true });
  },
};

export default command;
