import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('background')
    .setDescription('Define uma imagem de fundo (URL) para o seu perfil.')
    .addStringOption((opt) => opt.setName('url').setDescription('URL de uma imagem').setRequired(true)) as SlashCommandBuilder,
  category: 'profile',
  async execute(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString('url', true);
    if (!/^https?:\/\/.+\.(png|jpe?g|gif|webp)$/i.test(url)) {
      await interaction.reply({ embeds: [errorEmbed('URL inválida. Deve terminar em .png, .jpg, .gif ou .webp.')], ephemeral: true });
      return;
    }
    await userRepository.update(interaction.user.id, { background: url });
    await interaction.reply({ embeds: [successEmbed('Imagem de fundo atualizada!')], ephemeral: true });
  },
};

export default command;
