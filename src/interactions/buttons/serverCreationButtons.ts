import { EmbedBuilder } from 'discord.js';
import { ButtonHandlerModule } from '../../types/button.js';
import { serverCreationService, takePendingPlan } from '../../services/serverCreationService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { isOwner } from '../../config.js';

const confirm: ButtonHandlerModule = {
  customId: /^criar_confirmar_(.+)$/,
  async execute(interaction) {
    if (!interaction.guild || !isOwner(interaction.user.id)) {
      await interaction.reply({ embeds: [errorEmbed('Apenas o dono do bot pode confirmar isso.')], ephemeral: true });
      return;
    }

    const token = interaction.customId.replace('criar_confirmar_', '');
    const plan = takePendingPlan(token);

    if (!plan) {
      await interaction.update({ content: '⏰ Essa prévia expirou. Rode `/criar` novamente.', embeds: [], components: [] });
      return;
    }

    await interaction.update({ content: '⏳ Criando o servidor... isso pode levar alguns segundos.', embeds: [], components: [] });

    const result = await serverCreationService.execute(interaction.guild, plan);

    const summary = new EmbedBuilder()
      .setColor(result.failures.length > 0 ? colors.warning : colors.success)
      .setTitle('Servidor criado!')
      .addFields(
        { name: '✅ Cargos criados', value: `${result.createdRoles.length}`, inline: true },
        { name: '⏭️ Cargos já existentes (pulados)', value: `${result.skippedRoles.length}`, inline: true },
        { name: '✅ Canais criados', value: `${result.createdChannels.length}`, inline: true },
        { name: '⏭️ Canais já existentes (pulados)', value: `${result.skippedChannels.length}`, inline: true },
        { name: '📛 Renomeado', value: result.renamed ? 'Sim' : 'Não', inline: true },
        { name: '🆔 ID do registro (para rollback)', value: result.record.id }
      );

    if (result.failures.length > 0) {
      summary.addFields({ name: '⚠️ Falhas', value: result.failures.slice(0, 10).join('\n').slice(0, 1024) });
    }

    await interaction.editReply({ content: null, embeds: [summary] });
  },
};

const cancel: ButtonHandlerModule = {
  customId: /^criar_cancelar_(.+)$/,
  async execute(interaction) {
    const token = interaction.customId.replace('criar_cancelar_', '');
    takePendingPlan(token);
    await interaction.update({ content: '❌ Criação cancelada. Nada foi alterado no servidor.', embeds: [], components: [] });
  },
};

export default [confirm, cancel];
