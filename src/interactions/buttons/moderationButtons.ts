import { ButtonHandlerModule } from '../../types/button.js';
import { successEmbed } from '../../utils/embedUtils.js';

// customId: modconfirm_<action>_<targetId>
const confirmAction: ButtonHandlerModule = {
  customId: /^modconfirm_/,
  async execute(interaction) {
    // Ponto de extensão: ações de moderação que exigem confirmação (ex: banimentos em massa)
    // consultam esse handler para executar a ação real após o clique.
    await interaction.reply({ embeds: [successEmbed('Ação confirmada.')], ephemeral: true });
  },
};

export default confirmAction;
