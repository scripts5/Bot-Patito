import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { reminderService } from '../../services/reminderService.js';
import { colors } from '../../config/colors.js';
import { formatTimestamp } from '../../utils/timeUtils.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('reminders').setDescription('Lista seus lembretes ativos.') as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const reminders = reminderService.listByUser(interaction.user.id);

    if (reminders.length === 0) {
      await interaction.reply({ embeds: [errorEmbed('Você não tem lembretes ativos.')], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('Seus lembretes')
      .setDescription(reminders.map((r) => `\`${r.id}\` • ${r.message} • ${formatTimestamp(r.remindAt)}`).join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;
