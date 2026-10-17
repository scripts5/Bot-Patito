import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('bio')
    .setDescription('Mostra a biografia de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'profile',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const profile = userRepository.get(user.id);
    await interaction.reply({ embeds: [successEmbed(profile.bio ?? '_Sem biografia definida._', `Bio de ${user.username}`)] });
  },
};

export default command;
