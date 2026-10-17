import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('changelog').setDescription('Mostra as últimas atualizações do bot.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [
        infoEmbed(
          'v1.0.0 — Lançamento inicial: moderação, tickets, música, IA, economia, níveis, sorteios, automod, boas-vindas e o comando /criar.',
          'Changelog'
        ),
      ],
    });
  },
};

export default command;
