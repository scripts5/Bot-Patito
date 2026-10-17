import { ButtonHandlerModule } from '../../types/button.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

// customId: giveaway_join_<id>
const handler: ButtonHandlerModule = {
  customId: /^giveaway_join_(.+)$/,
  async execute(interaction) {
    const match = interaction.customId.match(/^giveaway_join_(.+)$/);
    const id = match?.[1];
    if (!id) return;

    const giveaway = giveawayRepository.getById(id);
    if (!giveaway || giveaway.ended) {
      await interaction.reply({ embeds: [errorEmbed('Esse sorteio já foi encerrado.')], ephemeral: true });
      return;
    }

    const added = await giveawayRepository.addParticipant(id, interaction.user.id);
    await interaction.reply({
      embeds: [
        added
          ? successEmbed('Você entrou no sorteio! Boa sorte 🍀')
          : successEmbed('Você já está participando desse sorteio.'),
      ],
      ephemeral: true,
    });
  },
};

export default handler;
