import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setticket')
    .setDescription('Define a categoria e o cargo de suporte para tickets.')
    .addChannelOption((opt) => opt.setName('categoria').setDescription('Categoria dos tickets').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
    .addRoleOption((opt) => opt.setName('cargo_suporte').setDescription('Cargo que vê os tickets')) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const category = interaction.options.getChannel('categoria', true);
    const role = interaction.options.getRole('cargo_suporte');

    await serverConfigService.update(interaction.guild!.id, {
      ticketCategoryId: category.id,
      ticketSupportRoleId: role?.id ?? null,
    });

    await interaction.reply({ embeds: [successEmbed('Configuração de tickets atualizada.')] });
  },
};

export default command;
