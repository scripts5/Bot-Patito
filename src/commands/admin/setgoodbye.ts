import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setgoodbye')
    .setDescription('Define o canal de despedidas.')
    .addChannelOption((opt) => opt.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('canal', true);
    await serverConfigService.update(interaction.guild!.id, { goodbyeChannelId: channel.id });
    await interaction.reply({ embeds: [successEmbed(`Canal de despedidas definido: ${channel}`)] });
  },
};

export default command;
