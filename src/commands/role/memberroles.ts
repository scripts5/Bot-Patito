import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('memberroles')
    .setDescription('Lista os cargos de um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const member = (interaction.options.getMember('usuario') as import('discord.js').GuildMember | null) ?? (await interaction.guild!.members.fetch(interaction.user.id));

    const roles = member.roles.cache.filter((r) => r.id !== interaction.guild!.id).sort((a, b) => b.position - a.position);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Cargos de ${member.displayName} (${roles.size})`)
      .setDescription(roles.map((r) => `${r}`).join('\n') || 'Nenhum cargo além de @everyone.');

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
