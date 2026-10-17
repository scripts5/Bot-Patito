import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { SHOP_ITEMS } from '../../services/economyService.js';
import { colors } from '../../config/colors.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('shop').setDescription('Mostra os itens disponíveis na loja.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(colors.gold)
      .setTitle('🛒 Loja')
      .setDescription(SHOP_ITEMS.map((i) => `${i.emoji} **${i.name}** — ${formatCurrency(i.price)} (\`${i.id}\`)`).join('\n'))
      .setFooter({ text: 'Use /buy id:<item> para comprar' });

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
