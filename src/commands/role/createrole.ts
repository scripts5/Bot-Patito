import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { isValidHexColor } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Cria um novo cargo no servidor.')
    .addStringOption((opt) => opt.setName('nome').setDescription('Nome do cargo').setRequired(true))
    .addStringOption((opt) => opt.setName('cor').setDescription('Cor em hexadecimal, ex: #5865F2')) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageRoles],
  botPermissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction: ChatInputCommandInteraction) {
    const name = interaction.options.getString('nome', true);
    const colorHex = interaction.options.getString('cor');

    if (colorHex && !isValidHexColor(colorHex)) {
      await interaction.reply({ embeds: [errorEmbed('Cor inválida. Use o formato #RRGGBB.')], ephemeral: true });
      return;
    }

    try {
      const role = await interaction.guild!.roles.create({
        name,
        color: colorHex ? (parseInt(colorHex.replace('#', ''), 16) as number) : undefined,
        reason: `Criado por ${interaction.user.tag}`,
      });
      await interaction.reply({ embeds: [successEmbed(`Cargo ${role} criado.`)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao criar cargo: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
