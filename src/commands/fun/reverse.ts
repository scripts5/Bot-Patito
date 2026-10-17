import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('Inverte o texto fornecido.')
    .addStringOption((opt) => opt.setName('texto').setDescription('Texto a inverter').setRequired(true)) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('texto', true);
    if (text.length > 500) {
      await interaction.reply({ embeds: [errorEmbed('Texto muito longo (máx. 500 caracteres).')], ephemeral: true });
      return;
    }
    await interaction.reply({ embeds: [successEmbed([...text].reverse().join(''))] });
  },
};

export default command;
