import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { reminderService } from '../../services/reminderService.js';
import { parseDuration, msToHuman } from '../../utils/timeUtils.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Cria um lembrete pessoal.')
    .addStringOption((opt) => opt.setName('tempo').setDescription('Ex: 10m, 2h, 1d').setRequired(true))
    .addStringOption((opt) => opt.setName('mensagem').setDescription('O que lembrar').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const durationStr = interaction.options.getString('tempo', true);
    const message = interaction.options.getString('mensagem', true);
    const durationMs = parseDuration(durationStr);

    if (!durationMs) {
      await interaction.reply({ embeds: [errorEmbed('Duração inválida. Use algo como 10m, 2h ou 1d.')], ephemeral: true });
      return;
    }

    await reminderService.create(interaction.user.id, interaction.guildId, interaction.channelId, message, Date.now() + durationMs);

    await interaction.reply({
      embeds: [successEmbed(`Vou te lembrar em ${msToHuman(durationMs)}: "${message}"`)],
      ephemeral: true,
    });
  },
};

export default command;
