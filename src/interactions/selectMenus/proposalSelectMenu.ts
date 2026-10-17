import { SelectMenuHandlerModule } from '../../types/selectMenu.js';
import { isOwner } from '../../config.js';
import { serverProposalService } from '../../services/serverProposalService.js';
import { PROPOSAL_EXPIRED, PROPOSAL_NOT_OWNER, buildProposalMessage } from '../../services/serverProposalView.js';

const handler: SelectMenuHandlerModule = {
  customId: /^prop_sel_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const proposal = serverProposalService.getPending(interaction.customId.replace('prop_sel_', ''));
    if (!proposal) {
      await interaction.update({ content: PROPOSAL_EXPIRED, embeds: [], components: [] });
      return;
    }
    // O menu lista todos os itens; o que vier em values é o que está marcado.
    const updated = await serverProposalService.setEnabled(proposal, interaction.values);
    await interaction.update(buildProposalMessage(updated));
  },
};

export default handler;
