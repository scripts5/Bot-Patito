import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isWithinLength } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setbio')
    .setDescription('Define sua biografia de perfil.')
    .addStringOption((opt) => opt.setName('texto').setDescription('Sua nova bio (máx. 200 caracteres)').setRequired(true)) as SlashCommandBuilder,
  category: 'profile',
  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('texto', true);
    if (!isWithinLength(text, 1, 200)) {
      await interaction.reply({ embeds: [errorEmbed('A bio deve ter entre 1 e 200 caracteres.')], ephemeral: true });
      return;
    }
    await userRepository.update(interaction.user.id, { bio: text });
    await interaction.reply({ embeds: [successEmbed('Bio atualizada!')], ephemeral: true });
  },
};

export default command;
