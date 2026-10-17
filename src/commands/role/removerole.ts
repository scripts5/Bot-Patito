import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove um cargo de um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo a remover').setRequired(true)) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.options.getMember('usuario') as import('discord.js').GuildMember | null;
    const role = interaction.options.getRole('cargo', true);

    if (!member) {
      await interaction.reply({ embeds: [errorEmbed('Usuário não encontrado no servidor.')], ephemeral: true });
      return;
    }

    try {
      await member.roles.remove(role.id, `Removido por ${interaction.user.tag}`);
      await interaction.reply({ embeds: [successEmbed(`Cargo "${role.name}" removido de ${member}.`)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao remover cargo: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
