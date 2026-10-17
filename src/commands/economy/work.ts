import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { formatCurrency } from '../../utils/formatters.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('work').setDescription('Trabalhe para ganhar moedas.') as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const result = await economyService.work(interaction.guild!.id, interaction.user.id);
    await interaction.reply({
      embeds: [result.ok ? successEmbed(`Você trabalhou e ganhou ${formatCurrency(result.amount!)}!`, 'Trabalho') : errorEmbed(result.message)],
    });
  },
};

export default command;
