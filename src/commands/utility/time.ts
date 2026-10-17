import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('time')
    .setDescription('Mostra a hora atual em um fuso horário.')
    .addStringOption((opt) => opt.setName('fuso').setDescription('Ex: America/Sao_Paulo (padrão: America/Sao_Paulo)')) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const timezone = interaction.options.getString('fuso') ?? 'America/Sao_Paulo';

    try {
      const formatted = new Date().toLocaleString('pt-BR', { timeZone: timezone });
      await interaction.reply({ embeds: [successEmbed(`🕒 ${formatted}`, `Hora em ${timezone}`)] });
    } catch {
      await interaction.reply({ content: 'Fuso horário inválido.', ephemeral: true });
    }
  },
};

export default command;
