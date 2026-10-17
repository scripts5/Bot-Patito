import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('crypto')
    .setDescription('Mostra o preço atual de uma criptomoeda.')
    .addStringOption((opt) => opt.setName('moeda').setDescription('Ex: bitcoin, ethereum').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const coin = interaction.options.getString('moeda', true).toLowerCase();
    await interaction.deferReply();

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd,brl`);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as Record<string, { usd?: number; brl?: number }>;
      const price = data[coin];

      if (!price) throw new Error('moeda não encontrada');

      await interaction.editReply({
        embeds: [successEmbed(`USD: $${price.usd}\nBRL: R$${price.brl}`, coin.toUpperCase())],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Não foi possível obter o preço: ${(err as Error).message}`)] });
    }
  },
};

export default command;
