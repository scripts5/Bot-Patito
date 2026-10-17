import { SelectMenuHandlerModule } from '../../types/selectMenu.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const handler: SelectMenuHandlerModule = {
  customId: 'role_select_menu',
  async execute(interaction) {
    if (!interaction.isRoleSelectMenu() || !interaction.guild) return;

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedRoleIds = interaction.values;

    try {
      await member.roles.set([
        ...member.roles.cache.filter((r) => !interaction.roles.has(r.id)).map((r) => r.id),
        ...selectedRoleIds,
      ]);
      await interaction.reply({ embeds: [successEmbed('Cargos atualizados.')], ephemeral: true });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao atualizar cargos: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default handler;
