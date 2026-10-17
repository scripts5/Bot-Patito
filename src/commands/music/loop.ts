import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { queueService } from '../../services/queueService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Define o modo de repetição.')
    .addStringOption((opt) =>
      opt
        .setName('modo')
        .setDescription('off, track ou queue')
        .setRequired(true)
        .addChoices({ name: 'Desligado', value: 'off' }, { name: 'Música atual', value: 'track' }, { name: 'Fila inteira', value: 'queue' })
    ) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const mode = interaction.options.getString('modo', true) as 'off' | 'track' | 'queue';
    const queue = queueService.get(interaction.guild!.id);
    if (!queue) {
      await interaction.reply({ embeds: [errorEmbed('Nenhuma sessão de música ativa.')], ephemeral: true });
      return;
    }
    queue.loop = mode;
    await interaction.reply({ embeds: [successEmbed(`🔁 Modo de repetição: **${mode}**.`)] });
  },
};

export default command;
