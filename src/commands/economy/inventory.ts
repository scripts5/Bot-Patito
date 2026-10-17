import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('inventory').setDescription('Mostra seu inventário de itens comprados.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const account = economyService.getBalance(interaction.guild!.id, interaction.user.id);
    const items = Object.entries(account.inventory);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`🎒 Inventário de ${interaction.user.username}`)
      .setDescription(items.length === 0 ? 'Vazio. Use `/shop` e `/buy` para comprar itens.' : items.map(([item, qty]) => `${item} x${qty}`).join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
