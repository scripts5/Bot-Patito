import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfere moedas para outro usuário (alias de /pay).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Destinatário').setRequired(true))
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Valor').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const amount = interaction.options.getInteger('quantidade', true);
    const result = await economyService.transfer(interaction.guild!.id, interaction.user.id, target.id, amount);
    await interaction.reply({ embeds: [result.ok ? successEmbed(result.message) : errorEmbed(result.message)] });
  },
};

export default command;
