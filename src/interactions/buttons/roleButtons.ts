import { ButtonHandlerModule } from '../../types/button.js';
import { errorEmbed, successEmbed } from '../../utils/embedUtils.js';

// customId no formato: role_toggle_<roleId>
const handler: ButtonHandlerModule = {
  customId: /^role_toggle_(\d+)$/,
  async execute(interaction) {
    const match = interaction.customId.match(/^role_toggle_(\d+)$/);
    const roleId = match?.[1];
    if (!roleId || !interaction.guild) {
      await interaction.reply({ embeds: [errorEmbed('Cargo inválido.')], ephemeral: true });
      return;
    }

    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      await interaction.reply({ embeds: [errorEmbed('Esse cargo não existe mais.')], ephemeral: true });
      return;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    const has = member.roles.cache.has(roleId);

    try {
      if (has) {
        await member.roles.remove(role);
        await interaction.reply({ embeds: [successEmbed(`Cargo ${role.name} removido.`)], ephemeral: true });
      } else {
        await member.roles.add(role);
        await interaction.reply({ embeds: [successEmbed(`Cargo ${role.name} adicionado.`)], ephemeral: true });
      }
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao atualizar cargo: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default handler;
