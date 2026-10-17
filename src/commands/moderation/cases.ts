import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { caseService } from '../../services/caseService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('cases')
    .setDescription('Lista os casos de moderação mais recentes do servidor.') as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const cases = caseService.listByGuild(interaction.guild!.id).slice(-15).reverse();

    if (cases.length === 0) {
      await interaction.reply({ embeds: [errorEmbed('Nenhum caso registrado ainda.')], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.neutral)
      .setTitle('Casos recentes')
      .setDescription(cases.map((c) => `#${c.caseId} • **${c.type}** • <@${c.targetId}> • ${c.reason.slice(0, 50)}`).join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
