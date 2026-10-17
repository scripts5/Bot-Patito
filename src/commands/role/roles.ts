import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('roles').setDescription('Lista todos os cargos do servidor.') as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const roles = interaction.guild!.roles.cache
      .filter((r) => r.id !== interaction.guild!.id)
      .sort((a, b) => b.position - a.position);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Cargos de ${interaction.guild!.name} (${roles.size})`)
      .setDescription(roles.map((r) => `${r} — ${r.members.size} membro(s)`).join('\n').slice(0, 4000) || 'Nenhum cargo.');

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
