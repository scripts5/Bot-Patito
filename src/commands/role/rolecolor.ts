import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isValidHexColor } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rolecolor')
    .setDescription('Muda a cor de um cargo.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo').setRequired(true))
    .addStringOption((opt) => opt.setName('cor').setDescription('Cor em hexadecimal, ex: #5865F2').setRequired(true)) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo', true);
    const colorHex = interaction.options.getString('cor', true);

    if (!isValidHexColor(colorHex)) {
      await interaction.reply({ embeds: [errorEmbed('Cor inválida. Use o formato #RRGGBB.')], ephemeral: true });
      return;
    }

    try {
      const guildRole = await interaction.guild!.roles.fetch(role.id);
      await guildRole?.setColor(parseInt(colorHex.replace('#', ''), 16), `Cor alterada por ${interaction.user.tag}`);
      await interaction.reply({ embeds: [successEmbed(`Cor de "${role.name}" atualizada.`)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao mudar cor: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
