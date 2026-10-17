import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverCreationService } from '../../services/serverCreationService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('servidor-rollback')
    .setDescription('[DONO] Desfaz uma criação de servidor feita pelo /criar (apaga só o que foi criado por ela).')
    .addStringOption((opt) =>
      opt.setName('id_registro').setDescription('ID do registro mostrado após o /criar (deixe vazio para ver o histórico)')
    ) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const recordId = interaction.options.getString('id_registro');

    if (!recordId) {
      const history = serverCreationService.getHistory(interaction.guild!.id);
      if (history.length === 0) {
        await interaction.reply({ embeds: [errorEmbed('Nenhuma criação registrada para esse servidor ainda.')], ephemeral: true });
        return;
      }
      const list = history
        .slice(-10)
        .reverse()
        .map((r) => `\`${r.id}\` — ${new Date(r.createdAt).toLocaleString('pt-BR')} (${r.createdRoleIds.length} cargos, ${r.createdChannelIds.length} canais)`)
        .join('\n');
      await interaction.reply({ embeds: [successEmbed(list, 'Histórico de criações (use o ID em /servidor-rollback)')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    try {
      const result = await serverCreationService.rollback(interaction.guild!, recordId);
      await interaction.editReply({
        embeds: [successEmbed(`Removidos: ${result.removedRoles} cargo(s), ${result.removedChannels} canal(is).`, 'Rollback concluído')],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
