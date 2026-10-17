import { SelectMenuHandlerModule } from '../../types/selectMenu.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const handler: SelectMenuHandlerModule = {
  customId: 'language_select_menu',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu() || !interaction.guild) return;
    const language = interaction.values[0];
    await serverConfigService.update(interaction.guild.id, { language });
    await interaction.reply({ embeds: [successEmbed(`Idioma definido para: ${language}`)], ephemeral: true });
  },
};

export default handler;
