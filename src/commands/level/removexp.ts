import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelRepository } from '../../database/repositories/levelRepository.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('[ADMIN] Remove XP de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Quantidade de XP').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    const amount = interaction.options.getInteger('quantidade', true);
    const account = levelRepository.get(interaction.guild!.id, user.id);
    const newXp = Math.max(0, account.xp - amount);
    await levelRepository.update(interaction.guild!.id, user.id, { xp: newXp });
    await interaction.reply({ embeds: [successEmbed(`${amount} XP removido de ${user}.`)] });
  },
};

export default command;
