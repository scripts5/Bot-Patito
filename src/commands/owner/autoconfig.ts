import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverProposalService } from '../../services/serverProposalService.js';
import { buildProposalMessage } from '../../services/serverProposalView.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('autoconfig')
    .setDescription('[DONO] Analisa o servidor e propõe melhorias (você aprova antes de qualquer mudança).')
    .addSubcommand((sub) =>
      sub.setName('analisar').setDescription('Escaneia o servidor e mostra uma proposta editável (nada muda até você aplicar).')
    )
    .addSubcommand((sub) =>
      sub
        .setName('desfazer')
        .setDescription('Desfaz uma proposta aplicada (deixe o ID vazio para ver o histórico).')
        .addStringOption((opt) => opt.setName('id').setDescription('ID do registro mostrado ao aplicar'))
    ),
  category: 'owner',
  ownerOnly: true,
  guildOnly: true,
  cooldown: 10,
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const sub = interaction.options.getSubcommand();

    if (sub === 'analisar') {
      await interaction.deferReply({ ephemeral: true });
      try {
        const proposal = await serverProposalService.build(guild);
        await interaction.editReply(buildProposalMessage(proposal));
      } catch (err) {
        await interaction.editReply({ embeds: [errorEmbed(`Não consegui analisar o servidor: ${(err as Error).message}`)] });
      }
      return;
    }

    // desfazer
    const id = interaction.options.getString('id');
    if (!id) {
      const history = serverProposalService.getUndoHistory(guild.id);
      if (history.length === 0) {
        await interaction.reply({ embeds: [errorEmbed('Nenhuma proposta aplicada neste servidor ainda.')], ephemeral: true });
        return;
      }
      const list = history
        .slice(-10)
        .reverse()
        .map((r) => `\`${r.id}\` — ${new Date(r.createdAt).toLocaleString('pt-BR')} (${r.createdChannelIds.length} canais, ${r.createdRoleIds.length} cargos)`)
        .join('\n');
      await interaction.reply({ embeds: [successEmbed(list, 'Propostas aplicadas (use o ID em /autoconfig desfazer)')], ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const r = await serverProposalService.undo(guild, id);
      await interaction.editReply({
        embeds: [
          successEmbed(
            `Canais removidos: ${r.channels}\nCargos removidos: ${r.roles}\nMensagens de regras apagadas: ${r.messages}\n` +
              `Permissões devolvidas ao @everyone: ${r.everyone}\nConfigurações anteriores restauradas: ${r.settings ? 'sim' : 'não'}`,
            'Proposta desfeita'
          ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
