import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('resetxp')
    .setDescription('[ADMIN] Reseta o nível e XP de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true)) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    await levelService.reset(interaction.guild!.id, user.id);
    await interaction.reply({ embeds: [successEmbed(`Nível e XP de ${user} resetados.`)] });
  },
};

export default command;
