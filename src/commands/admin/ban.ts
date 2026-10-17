import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane um usuário do servidor.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário a banir').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo do banimento').setRequired(false))
    .addIntegerOption((opt) =>
      opt.setName('apagar_mensagens_dias').setDescription('Dias de mensagens a apagar (0-7)').setMinValue(0).setMaxValue(7)
    ) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.BanMembers],
  botPermissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';
    const days = interaction.options.getInteger('apagar_mensagens_dias') ?? 0;
    const actor = await interaction.guild!.members.fetch(interaction.user.id);

    await interaction.deferReply();

    const result = await moderacaoService.ban(interaction.guild!, actor, target, reason, days * 86400);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Banimento') : errorEmbed(result.message, 'Banimento falhou')],
    });
  },
};

export default command;
