import { ModalHandlerModule } from '../../types/modal.js';
import { isOwner } from '../../config.js';
import { serverProposalService } from '../../services/serverProposalService.js';
import { PROPOSAL_EXPIRED, PROPOSAL_NOT_OWNER, buildProposalMessage } from '../../services/serverProposalView.js';

const handler: ModalHandlerModule = {
  customId: /^prop_modal_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const proposal = serverProposalService.getPending(interaction.customId.replace('prop_modal_', ''));
    if (!proposal) {
      await interaction.reply({ content: PROPOSAL_EXPIRED, ephemeral: true });
      return;
    }

    const text = interaction.fields.getTextInputValue('rules');
    const updated = await serverProposalService.setRulesText(proposal, text);

    if (interaction.isFromMessage()) {
      await interaction.update(buildProposalMessage(updated));
    } else {
      await interaction.reply({ content: 'Regras atualizadas na proposta.', ephemeral: true });
    }
  },
};

export default handler;
