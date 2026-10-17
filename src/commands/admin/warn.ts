import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { warningService } from '../../services/warningService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Aplica uma advertência a um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo').setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const reason = interaction.options.getString('motivo', true);

    await interaction.deferReply();
    const { case: moderationCase } = await warningService.warn(interaction.guild!.id, target.id, interaction.user.id, reason);

    await interaction.editReply({
      embeds: [successEmbed(`${target} foi advertido. Motivo: ${reason}. Caso #${moderationCase.caseId}.`, 'Advertência')],
    });
  },
};

export default command;
