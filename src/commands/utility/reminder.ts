import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { reminderService } from '../../services/reminderService.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Remove um lembrete específico pelo ID.')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do lembrete (veja em /reminders)').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const removed = await reminderService.remove(id, interaction.user.id);
    await interaction.reply({
      embeds: [removed ? successEmbed('Lembrete removido.') : errorEmbed('Lembrete não encontrado.')],
      ephemeral: true,
    });
  },
};

export default command;
