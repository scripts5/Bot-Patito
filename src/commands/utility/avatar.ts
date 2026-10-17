import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Mostra o avatar de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário (padrão: você)')) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
