import { ModalHandlerModule } from '../../types/modal.js';
import { successEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const handler: ModalHandlerModule = {
  customId: 'report_modal',
  async execute(interaction) {
    const target = interaction.fields.getTextInputValue('target');
    const reason = interaction.fields.getTextInputValue('reason');
    logger.moderation(`report by=${interaction.user.id} target="${target}" reason="${reason}"`);
    await interaction.reply({ embeds: [successEmbed('Denúncia registrada. A equipe vai revisar.')], ephemeral: true });
  },
};

export default handler;
