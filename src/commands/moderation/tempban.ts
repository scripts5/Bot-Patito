import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { parseDuration, msToHuman } from '../../utils/timeUtils.js';
import { reminderRepository } from '../../database/repositories/reminderRepository.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('tempban')
    .setDescription('Bane um usuário temporariamente.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário a banir').setRequired(true))
    .addStringOption((opt) => opt.setName('duracao').setDescription('Ex: 1d, 7d, 1h').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo')) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const durationStr = interaction.options.getString('duracao', true);
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';
    const durationMs = parseDuration(durationStr);

    if (!durationMs) {
      await interaction.reply({ embeds: [errorEmbed('Duração inválida. Use algo como 1d, 7d ou 1h.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const actor = await interaction.guild!.members.fetch(interaction.user.id);
    const result = await moderacaoService.ban(interaction.guild!, actor, target, `[TEMP: ${durationStr}] ${reason}`);

    if (result.ok) {
      // Reaproveita o sistema de lembretes/jobs para agendar o desbanimento automático.
      await reminderRepository.create({
        userId: interaction.client.user!.id,
        guildId: interaction.guild!.id,
        channelId: interaction.channelId,
        message: `__TEMPBAN_UNDO__:${target.id}`,
        remindAt: Date.now() + durationMs,
      });
    }

    await interaction.editReply({
      embeds: [
        result.ok
          ? successEmbed(`${result.message} Desbanimento automático em ${msToHuman(durationMs)}.`, 'Ban temporário')
          : errorEmbed(result.message, 'Ban temporário falhou'),
      ],
    });
  },
};

export default command;
