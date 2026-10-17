import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('stocks')
    .setDescription('Consulta de ações (requer API de mercado configurada).')
    .addStringOption((opt) => opt.setName('ticker').setDescription('Ex: PETR4, AAPL').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const ticker = interaction.options.getString('ticker', true);
    await interaction.reply({
      embeds: [
        infoEmbed(
          `Consulta de ações para "${ticker}" requer uma API paga de mercado financeiro, ainda não configurada nesse bot.`,
          'Indisponível'
        ),
      ],
      ephemeral: true,
    });
  },
};

export default command;
