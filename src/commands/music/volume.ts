import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { clamp } from '../../utils/mathUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Define o volume da reprodução (0-100).')
    .addIntegerOption((opt) => opt.setName('nivel').setDescription('0 a 100').setRequired(true).setMinValue(0).setMaxValue(100)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);
    if (!queue) {
      await interaction.reply({ embeds: [errorEmbed('Nenhuma sessão de música ativa.')], ephemeral: true });
      return;
    }
    queue.volume = clamp(interaction.options.getInteger('nivel', true), 0, 100);
    await interaction.reply({ embeds: [successEmbed(`🔊 Volume definido para ${queue.volume}%.`)] });
  },
};

export default command;
