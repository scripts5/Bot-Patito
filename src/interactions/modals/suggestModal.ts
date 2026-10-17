import { ModalHandlerModule } from '../../types/modal.js';
import { successEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const handler: ModalHandlerModule = {
  customId: 'suggest_modal',
  async execute(interaction) {
    const suggestion = interaction.fields.getTextInputValue('suggestion');
    logger.info('suggest', `De ${interaction.user.tag}: ${suggestion}`);
    await interaction.reply({ embeds: [successEmbed('Sugestão enviada. Obrigado!')], ephemeral: true });
  },
};

export default handler;
