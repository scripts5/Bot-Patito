import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { parseDuration } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Silencia um membro (timeout).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption((opt) => opt.setName('duracao').setDescription('Ex: 10m, 1h (padrão 10m)'))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo')) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('usuario') as GuildMember | null;
    const durationStr = interaction.options.getString('duracao') ?? '10m';
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';
    const durationMs = parseDuration(durationStr);

    if (!target) {
      await interaction.reply({ embeds: [errorEmbed('Esse usuário não está no servidor.')], ephemeral: true });
      return;
    }
    if (!durationMs) {
      await interaction.reply({ embeds: [errorEmbed('Duração inválida.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const actor = await interaction.guild!.members.fetch(interaction.user.id);
    const result = await moderacaoService.timeout(interaction.guild!, actor, target, durationMs, reason);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Mute') : errorEmbed(result.message, 'Mute falhou')],
    });
  },
};

export default command;
