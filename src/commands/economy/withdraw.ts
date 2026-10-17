import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('Saca moedas do banco para a carteira.')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const result = await economyService.withdraw(interaction.guild!.id, interaction.user.id, amount);
    await interaction.reply({ embeds: [result.ok ? successEmbed(result.message) : errorEmbed(result.message)] });
  },
};

export default command;
