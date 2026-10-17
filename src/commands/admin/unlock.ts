import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Destranca o canal atual.')
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo')) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction: ChatInputCommandInteraction) {
    const channel = interaction.channel as TextChannel;
    const reason = interaction.options.getString('motivo') ?? 'Nenhum motivo informado';

    try {
      await channel.permissionOverwrites.edit(interaction.guild!.roles.everyone, { SendMessages: null }, { reason });
      await interaction.reply({ embeds: [successEmbed(`Canal destrancado. Motivo: ${reason}`, 'Unlock')] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao destrancar o canal: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
