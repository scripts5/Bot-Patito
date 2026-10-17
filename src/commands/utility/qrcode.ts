import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Gera um QR code a partir de um texto ou link.')
    .addStringOption((opt) => opt.setName('conteudo').setDescription('Texto ou URL').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const content = interaction.options.getString('conteudo', true);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(content)}`;

    const embed = new EmbedBuilder().setColor(colors.primary).setTitle('QR Code').setImage(url);
    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
