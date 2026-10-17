import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { userRepository } from '../../database/repositories/userRepository.js';
import { levelService } from '../../services/levelService.js';
import { economyService } from '../../services/economyService.js';
import { colors } from '../../config/colors.js';
import { formatCurrency } from '../../utils/formatters.js';
import { isValidHexColor } from '../../utils/validators.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Mostra o perfil completo de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'profile',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const profile = userRepository.get(user.id);
    const level = levelService.getProfile(interaction.guild!.id, user.id);
    const eco = economyService.getBalance(interaction.guild!.id, user.id);

    const color = profile.color && isValidHexColor(profile.color) ? parseInt(profile.color.replace('#', ''), 16) : colors.primary;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`Perfil de ${user.username}`)
      .setThumbnail(user.displayAvatarURL())
      .setDescription(profile.bio ?? '_Sem biografia definida. Use /setbio._')
      .addFields(
        { name: 'Nível', value: `${level.level}`, inline: true },
        { name: 'Reputação', value: `${profile.reputation}`, inline: true },
        { name: 'Saldo', value: formatCurrency(eco.balance + eco.bank), inline: true },
        { name: 'Emblemas', value: profile.badges.length > 0 ? profile.badges.join(' ') : 'Nenhum' }
      );

    if (profile.background) embed.setImage(profile.background);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
