import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Mostra seu nível e XP (ou de outro usuário).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const profile = levelService.getProfile(interaction.guild!.id, user.id);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Rank de ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'Nível', value: `${profile.level}`, inline: true },
        { name: 'XP', value: `${profile.xp}/${profile.xpNeeded}`, inline: true },
        { name: 'Prestígio', value: `${profile.prestige}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
