import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('remove-music')
    .setDescription('Remove uma música específica da fila pelo número.')
    .addIntegerOption((opt) => opt.setName('posicao').setDescription('Posição na fila (veja com /queue)').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const position = interaction.options.getInteger('posicao', true);
    const removed = queueService.remove(interaction.guild!.id, position - 1);
    await interaction.reply({ embeds: [removed ? successEmbed(`Removido: **${removed.title}**`) : errorEmbed('Posição inválida.')] });
  },
};

export default command;
