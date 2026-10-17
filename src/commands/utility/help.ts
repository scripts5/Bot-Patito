import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('help').setDescription('Mostra os comandos disponíveis por categoria.') as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    const categories = [...new Set(client.commands.map((c) => c.category).filter(Boolean))] as string[];

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('📖 Central de Ajuda')
      .setDescription(`Selecione uma categoria abaixo para ver os comandos.\nTotal: **${client.commands.size}** comandos.`);

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_category_select')
      .setPlaceholder('Escolha uma categoria')
      .addOptions(categories.slice(0, 25).map((cat) => ({ label: cat, value: cat })));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
