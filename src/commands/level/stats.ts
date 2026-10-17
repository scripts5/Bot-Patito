import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelService } from '../../services/levelService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('stats-nivel')
    .setDescription('Estatísticas detalhadas de nível de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const profile = levelService.getProfile(interaction.guild!.id, user.id);
    const percent = Math.floor((profile.xp / profile.xpNeeded) * 100);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Estatísticas de ${user.username}`)
      .addFields(
        { name: 'Nível', value: `${profile.level}`, inline: true },
        { name: 'Prestígio', value: `${profile.prestige}`, inline: true },
        { name: 'Progresso', value: `${profile.xp}/${profile.xpNeeded} (${percent}%)` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
