import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove o timeout de um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo')) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  botPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getMember('usuario') as GuildMember | null;
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';

    if (!target) {
      await interaction.reply({ embeds: [errorEmbed('Esse usuário não está no servidor.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const actor = await interaction.guild!.members.fetch(interaction.user.id);
    const result = await moderacaoService.untimeout(interaction.guild!, actor, target, reason);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Timeout removido') : errorEmbed(result.message, 'Falha')],
    });
  },
};

export default command;
