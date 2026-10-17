import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isValidHexColor } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('editrole')
    .setDescription('Edita nome e/ou cor de um cargo.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo a editar').setRequired(true))
    .addStringOption((opt) => opt.setName('nome').setDescription('Novo nome'))
    .addStringOption((opt) => opt.setName('cor').setDescription('Nova cor em hexadecimal')) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo', true);
    const name = interaction.options.getString('nome');
    const colorHex = interaction.options.getString('cor');

    if (colorHex && !isValidHexColor(colorHex)) {
      await interaction.reply({ embeds: [errorEmbed('Cor inválida.')], ephemeral: true });
      return;
    }
    if (!name && !colorHex) {
      await interaction.reply({ embeds: [errorEmbed('Informe ao menos um campo para editar (nome ou cor).')], ephemeral: true });
      return;
    }

    try {
      const guildRole = await interaction.guild!.roles.fetch(role.id);
      await guildRole?.edit({
        name: name ?? undefined,
        color: colorHex ? (parseInt(colorHex.replace('#', ''), 16) as number) : undefined,
        reason: `Editado por ${interaction.user.tag}`,
      });
      await interaction.reply({ embeds: [successEmbed('Cargo atualizado.')] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao editar cargo: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
