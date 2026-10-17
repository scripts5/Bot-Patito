import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Apaga um cargo do servidor.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo a apagar').setRequired(true)) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo', true);
    try {
      await interaction.guild!.roles.delete(role.id, `Apagado por ${interaction.user.tag}`);
      await interaction.reply({ embeds: [successEmbed(`Cargo "${role.name}" apagado.`)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao apagar cargo: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
