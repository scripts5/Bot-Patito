import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rolemembers')
    .setDescription('Lista os membros que possuem um cargo específico.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo').setRequired(true)) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo', true);
    const fullRole = interaction.guild!.roles.cache.get(role.id);
    const members = fullRole?.members.map((m) => m.toString()) ?? [];

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Membros com o cargo "${role.name}" (${members.length})`)
      .setDescription(members.slice(0, 50).join('\n') || 'Nenhum membro possui esse cargo.');

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
