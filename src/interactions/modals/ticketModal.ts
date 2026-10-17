import { ModalHandlerModule } from '../../types/modal.js';
import { ticketService } from '../../services/ticketService.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

const handler: ModalHandlerModule = {
  customId: 'ticket_reason_modal',
  async execute(interaction) {
    if (!interaction.guild) return;
    const reason = interaction.fields.getTextInputValue('reason');
    const member = await interaction.guild.members.fetch(interaction.user.id);

    const blocked = await ticketService.canOpen(interaction.guild.id, member.id);
    if (blocked) {
      await interaction.reply({ embeds: [errorEmbed(blocked)], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const { channel } = await ticketService.openTicket(interaction.guild, member, reason);
      await interaction.editReply({ embeds: [successEmbed(`Ticket criado: ${channel}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default handler;
