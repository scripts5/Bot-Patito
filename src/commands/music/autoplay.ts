import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('autoplay').setDescription('Ativa/desativa o autoplay (não implementado para sugerir músicas ainda).') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const queue = queueService.get(interaction.guild!.id);
    if (!queue) {
      await interaction.reply({ embeds: [errorEmbed('Nenhuma sessão de música ativa.')], ephemeral: true });
      return;
    }
    queue.autoplay = !queue.autoplay;
    await interaction.reply({ embeds: [successEmbed(`Autoplay ${queue.autoplay ? 'ativado' : 'desativado'}.`)] });
  },
};

export default command;
