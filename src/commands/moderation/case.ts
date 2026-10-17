import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { caseService } from '../../services/caseService.js';
import { EmbedBuilder } from 'discord.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('Mostra detalhes de um caso de moderação.')
    .addIntegerOption((opt) => opt.setName('numero').setDescription('Número do caso').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const caseId = interaction.options.getInteger('numero', true);
    const moderationCase = caseService.getCase(interaction.guild!.id, caseId);

    if (!moderationCase) {
      await interaction.reply({ embeds: [errorEmbed('Caso não encontrado.')], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.neutral)
      .setTitle(`Caso #${moderationCase.caseId} — ${moderationCase.type}`)
      .addFields(
        { name: 'Alvo', value: `<@${moderationCase.targetId}>`, inline: true },
        { name: 'Moderador', value: `<@${moderationCase.moderatorId}>`, inline: true },
        { name: 'Motivo', value: moderationCase.reason || 'Nenhum motivo informado' }
      )
      .setTimestamp(moderationCase.createdAt);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
