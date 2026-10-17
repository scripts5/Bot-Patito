import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelRepository } from '../../database/repositories/levelRepository.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('[ADMIN] Adiciona XP a um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true))
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('Quantidade de XP').setRequired(true).setMinValue(1)) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    const amount = interaction.options.getInteger('quantidade', true);
    const { account } = await levelRepository.addXp(interaction.guild!.id, user.id, amount);
    await interaction.reply({ embeds: [successEmbed(`${amount} XP adicionado a ${user}. Nível atual: ${account.level}.`)] });
  },
};

export default command;
