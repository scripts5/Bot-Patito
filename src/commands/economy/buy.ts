import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService, SHOP_ITEMS } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Compra um item da loja.')
    .addStringOption((opt) =>
      opt
        .setName('item')
        .setDescription('Item a comprar')
        .setRequired(true)
        .addChoices(...SHOP_ITEMS.map((i) => ({ name: i.name, value: i.id })))
    ) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const itemId = interaction.options.getString('item', true);
    const result = await economyService.buyItem(interaction.guild!.id, interaction.user.id, itemId);
    await interaction.reply({ embeds: [result.ok ? successEmbed(result.message, 'Compra') : errorEmbed(result.message)] });
  },
};

export default command;
