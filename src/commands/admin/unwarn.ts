import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { warningService } from '../../services/warningService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Remove uma advertência pelo ID.')
    .addStringOption((opt) => opt.setName('id_advertencia').setDescription('ID da advertência').setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const warningId = interaction.options.getString('id_advertencia', true);
    await interaction.deferReply();
    const removed = await warningService.unwarn(interaction.guild!.id, warningId, interaction.user.id);

    await interaction.editReply({
      embeds: [removed ? successEmbed('Advertência removida.') : errorEmbed('Advertência não encontrada.')],
    });
  },
};

export default command;
