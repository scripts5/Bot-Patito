import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { warningService } from '../../services/warningService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adiciona uma advertência a um membro (alias de /warn).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const reason = interaction.options.getString('motivo', true);
    await interaction.deferReply();
    const { case: moderationCase } = await warningService.warn(interaction.guild!.id, target.id, interaction.user.id, reason);
    await interaction.editReply({
      embeds: [successEmbed(`Advertência adicionada a ${target}. Caso #${moderationCase.caseId}.`)],
    });
  },
};

export default command;
