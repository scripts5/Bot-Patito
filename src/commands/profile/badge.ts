import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('badge')
    .setDescription('[ADMIN] Adiciona um emblema ao perfil de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addStringOption((opt) => opt.setName('emoji').setDescription('Emoji do emblema').setRequired(true)) as SlashCommandBuilder,
  category: 'profile',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    const emoji = interaction.options.getString('emoji', true);
    const profile = userRepository.get(user.id);

    if (profile.badges.includes(emoji)) {
      await interaction.reply({ embeds: [successEmbed('Esse usuário já tem esse emblema.')], ephemeral: true });
      return;
    }

    await userRepository.update(user.id, { badges: [...profile.badges, emoji] });
    await interaction.reply({ embeds: [successEmbed(`Emblema ${emoji} adicionado a ${user}.`)] });
  },
};

export default command;
