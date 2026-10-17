import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelRepository } from '../../database/repositories/levelRepository.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setlevel')
    .setDescription('[ADMIN] Define o nível de um usuário diretamente.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption((opt) => opt.setName('nivel').setDescription('Novo nível').setRequired(true).setMinValue(0)) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    const level = interaction.options.getInteger('nivel', true);
    await levelRepository.update(interaction.guild!.id, user.id, { level, xp: 0 });
    await interaction.reply({ embeds: [successEmbed(`Nível de ${user} definido para ${level}.`)] });
  },
};

export default command;
