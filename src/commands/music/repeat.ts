import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

// Alias rápido de /loop track: repete só a música atual.
const command: Command = {
  data: new SlashCommandBuilder().setName('repeat').setDescription('Ativa/desativa a repetição da música atual.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);
    if (!queue) {
      await interaction.reply({ embeds: [errorEmbed('Nenhuma sessão de música ativa.')], ephemeral: true });
      return;
    }
    queue.loop = queue.loop === 'track' ? 'off' : 'track';
    await interaction.reply({ embeds: [successEmbed(queue.loop === 'track' ? '🔂 Repetindo a música atual.' : '🔁 Repetição desativada.')] });
  },
};

export default command;
