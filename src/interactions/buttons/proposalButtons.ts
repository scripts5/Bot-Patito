import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { ButtonHandlerModule } from '../../types/button.js';
import { isOwner } from '../../config.js';
import { MAX_RULES_LENGTH } from '../../services/serverRulesService.js';
import { serverProposalService } from '../../services/serverProposalService.js';
import {
  PROPOSAL_EXPIRED,
  PROPOSAL_NOT_OWNER,
  buildProposalMessage,
  buildResultEmbed,
} from '../../services/serverProposalView.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const apply: ButtonHandlerModule = {
  customId: /^prop_apply_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const proposal = serverProposalService.getPending(interaction.customId.replace('prop_apply_', ''));
    if (!proposal) {
      await interaction.update({ content: PROPOSAL_EXPIRED, embeds: [], components: [] });
      return;
    }
    const guild = interaction.client.guilds.cache.get(proposal.guildId);
    if (!guild) {
      await interaction.reply({ embeds: [errorEmbed('Não encontrei o servidor dessa proposta. O bot ainda está nele?')], ephemeral: true });
      return;
    }

    await interaction.update({ content: '⏳ Aplicando só o que você aprovou...', embeds: [], components: [] });
    try {
      const result = await serverProposalService.apply(guild, proposal);
      await interaction.editReply({ content: null, embeds: [buildResultEmbed(result)], components: [] });
    } catch (err) {
      await interaction.editReply({ content: null, embeds: [errorEmbed(`Falha ao aplicar: ${(err as Error).message}`)], components: [] });
    }
  },
};

const cancel: ButtonHandlerModule = {
  customId: /^prop_cancel_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const proposal = serverProposalService.get(interaction.customId.replace('prop_cancel_', ''));
    if (proposal && proposal.status === 'pending') await serverProposalService.cancel(proposal);
    await interaction.update({ content: '❌ Proposta cancelada. Nada foi alterado no servidor.', embeds: [], components: [] });
  },
};

const editRules: ButtonHandlerModule = {
  customId: /^prop_rules_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const id = interaction.customId.replace('prop_rules_', '');
    const proposal = serverProposalService.getPending(id);
    if (!proposal) {
      await interaction.update({ content: PROPOSAL_EXPIRED, embeds: [], components: [] });
      return;
    }

    const input = new TextInputBuilder()
      .setCustomId('rules')
      .setLabel('Texto das regras')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(proposal.rulesText.slice(0, MAX_RULES_LENGTH))
      .setMinLength(20)
      .setMaxLength(MAX_RULES_LENGTH)
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId(`prop_modal_${id}`)
      .setTitle('Editar regras do servidor')
      .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
  },
};

const regen: ButtonHandlerModule = {
  customId: /^prop_regen_(.+)$/,
  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      await interaction.reply({ content: PROPOSAL_NOT_OWNER, ephemeral: true });
      return;
    }
    const proposal = serverProposalService.getPending(interaction.customId.replace('prop_regen_', ''));
    if (!proposal) {
      await interaction.update({ content: PROPOSAL_EXPIRED, embeds: [], components: [] });
      return;
    }
    await interaction.deferUpdate(); // a IA pode demorar mais de 3s
    const updated = await serverProposalService.regenerateRules(proposal);
    await interaction.editReply(buildProposalMessage(updated));
  },
};

export default [apply, cancel, editRules, regen];
