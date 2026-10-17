import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { ticketService } from '../../services/ticketService.js';
import { transcriptService } from '../../services/transcriptService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('close').setDescription('Fecha o ticket do canal atual (gera transcript antes).') as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    await transcriptService.generate(interaction.channel as TextChannel).catch(() => null);
    await ticketService.close(interaction.channelId, interaction.user.id);

    await interaction.editReply({ embeds: [successEmbed('Ticket fechado. Transcript salvo. Canal será removido em 5s.')] });

    setTimeout(() => {
      (interaction.channel as TextChannel).delete('Ticket fechado').catch(() => undefined);
    }, 5000);
  },
};

export default command;
