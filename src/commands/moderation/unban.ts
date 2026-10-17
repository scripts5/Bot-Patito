import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isValidSnowflake } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Remove o banimento de um usuário.')
    .addStringOption((opt) => opt.setName('id_usuario').setDescription('ID do usuário a desbanir').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo do desbanimento')) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.options.getString('id_usuario', true);
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';

    if (!isValidSnowflake(userId)) {
      await interaction.reply({ embeds: [errorEmbed('ID de usuário inválido.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const actor = await interaction.guild!.members.fetch(interaction.user.id);
    const result = await moderacaoService.unban(interaction.guild!, actor, userId, reason);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Desbanimento') : errorEmbed(result.message, 'Desbanimento falhou')],
    });
  },
};

export default command;
