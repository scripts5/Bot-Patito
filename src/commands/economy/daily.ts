import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('daily').setDescription('Resgata sua recompensa diária.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const result = await economyService.daily(interaction.guild!.id, interaction.user.id);
    await interaction.reply({
      embeds: [result.ok ? successEmbed(`Você recebeu ${formatCurrency(result.amount!)}!`, 'Diária') : errorEmbed(result.message)],
    });
  },
};

export default command;
