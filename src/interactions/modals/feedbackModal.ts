import { ModalHandlerModule } from '../../types/modal.js';
import { successEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const handler: ModalHandlerModule = {
  customId: 'feedback_modal',
  async execute(interaction) {
    const feedback = interaction.fields.getTextInputValue('feedback');
    logger.info('feedback', `De ${interaction.user.tag} (${interaction.user.id}): ${feedback}`);
    await interaction.reply({ embeds: [successEmbed('Obrigado pelo seu feedback!')], ephemeral: true });
  },
};

export default handler;
