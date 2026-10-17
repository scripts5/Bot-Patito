import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setmodlog')
    .setDescription('Define o canal de logs de moderação.')
    .addChannelOption((opt) => opt.setName('canal').setDescription('Canal de texto').addChannelTypes(ChannelType.GuildText).setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('canal', true);
    await serverConfigService.update(interaction.guild!.id, { modLogChannelId: channel.id });
    await interaction.reply({ embeds: [successEmbed(`Canal de logs de moderação definido: ${channel}`)] });
  },
};

export default command;
