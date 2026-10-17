import { ChannelType, TextChannel } from 'discord.js';
import { ButtonHandlerModule } from '../../types/button.js';
import { ticketService } from '../../services/ticketService.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

const openTicket: ButtonHandlerModule = {
  customId: 'ticket_open',
  async execute(interaction) {
    if (!interaction.guild) return;
    const member = await interaction.guild.members.fetch(interaction.user.id);

    const blocked = await ticketService.canOpen(interaction.guild.id, member.id);
    if (blocked) {
      await interaction.reply({ embeds: [errorEmbed(blocked)], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const { channel } = await ticketService.openTicket(interaction.guild, member, null);
      await interaction.editReply({ embeds: [successEmbed(`Ticket criado: ${channel}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

const claimTicket: ButtonHandlerModule = {
  customId: 'ticket_claim',
  async execute(interaction) {
    const ticket = await ticketService.claim(interaction.channelId, interaction.user.id);
    await interaction.reply({
      embeds: [ticket ? successEmbed(`Ticket assumido por ${interaction.user}.`) : errorEmbed('Ticket não encontrado.')],
    });
  },
};

const closeTicket: ButtonHandlerModule = {
  customId: 'ticket_close',
  async execute(interaction) {
    if (!interaction.guild || interaction.channel?.type !== ChannelType.GuildText) return;

    await ticketService.close(interaction.channelId, interaction.user.id);
    await interaction.reply({ embeds: [successEmbed('Ticket será fechado em 5 segundos...')] });

    setTimeout(async () => {
      try {
        await (interaction.channel as TextChannel).delete('Ticket fechado');
      } catch {
        // canal já pode ter sido apagado manualmente
      }
    }, 5000);
  },
};

export default [openTicket, claimTicket, closeTicket];
