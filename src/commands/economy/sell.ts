import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService, SHOP_ITEMS } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Vende um item do seu inventário (por metade do preço).')
    .addStringOption((opt) =>
      opt
        .setName('item')
        .setDescription('Item a vender')
        .setRequired(true)
        .addChoices(...SHOP_ITEMS.map((i) => ({ name: i.name, value: i.id })))
    ) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const itemId = interaction.options.getString('item', true);
    const result = await economyService.sellItem(interaction.guild!.id, interaction.user.id, itemId);
    await interaction.reply({ embeds: [result.ok ? successEmbed(result.message, 'Venda') : errorEmbed(result.message)] });
  },
};

export default command;
