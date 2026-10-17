import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { ticketService } from '../../services/ticketService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('claim').setDescription('Assume o ticket do canal atual.') as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction: ChatInputCommandInteraction) {
    const ticket = await ticketService.claim(interaction.channelId, interaction.user.id);
    await interaction.reply({
      embeds: [ticket ? successEmbed(`Ticket assumido por ${interaction.user}.`) : errorEmbed('Esse canal não é um ticket.')],
    });
  },
};

export default command;
