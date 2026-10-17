import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('downvote')
    .setDescription('Dá -1 de reputação a um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true)) as SlashCommandBuilder,
  category: 'profile',
  cooldown: 3600,
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario', true);
    if (user.id === interaction.user.id) {
      await interaction.reply({ embeds: [errorEmbed('Você não pode votar em si mesmo.')], ephemeral: true });
      return;
    }
    const updated = await userRepository.addReputation(user.id, -1);
    await interaction.reply({ embeds: [successEmbed(`-1 reputação para ${user}. Total: ${updated.reputation}.`)] });
  },
};

export default command;
