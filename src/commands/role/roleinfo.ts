import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { formatTimestamp } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Mostra informações detalhadas de um cargo.')
    .addRoleOption((opt) => opt.setName('cargo').setDescription('Cargo').setRequired(true)) as SlashCommandBuilder,
  category: 'role',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const role = interaction.options.getRole('cargo', true);
    const fullRole = interaction.guild!.roles.cache.get(role.id);

    const embed = new EmbedBuilder()
      .setColor(fullRole?.color || colors.primary)
      .setTitle(`Cargo: ${role.name}`)
      .addFields(
        { name: 'ID', value: role.id, inline: true },
        { name: 'Cor', value: fullRole ? `#${fullRole.color.toString(16).padStart(6, '0')}` : 'N/A', inline: true },
        { name: 'Membros', value: `${fullRole?.members.size ?? 0}`, inline: true },
        { name: 'Mencionável', value: fullRole?.mentionable ? 'Sim' : 'Não', inline: true },
        { name: 'Separado na lista', value: fullRole?.hoist ? 'Sim' : 'Não', inline: true },
        { name: 'Criado em', value: fullRole ? formatTimestamp(fullRole.createdTimestamp, 'F') : 'N/A' }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
