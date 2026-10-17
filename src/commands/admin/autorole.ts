import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Define o cargo automático dado a novos membros.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo (deixe vazio para desativar)')) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo');
    await serverConfigService.update(interaction.guild!.id, { autoroleId: role?.id ?? null });
    await interaction.reply({
      embeds: [successEmbed(role ? `Autorole definido: ${role.name}` : 'Autorole desativado.')],
    });
  },
};

export default command;
