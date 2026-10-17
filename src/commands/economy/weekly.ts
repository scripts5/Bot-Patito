import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('weekly').setDescription('Resgata sua recompensa semanal.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const result = await economyService.weekly(interaction.guild!.id, interaction.user.id);
    await interaction.reply({
      embeds: [result.ok ? successEmbed(`Você recebeu ${formatCurrency(result.amount!)}!`, 'Semanal') : errorEmbed(result.message)],
    });
  },
};

export default command;
