import { EmbedBuilder } from 'discord.js';
import { SelectMenuHandlerModule } from '../../types/selectMenu.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { colors } from '../../config/colors.js';

const handler: SelectMenuHandlerModule = {
  customId: 'settings_select_menu',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu() || !interaction.guild) return;
    const settings = serverConfigService.getSettings(interaction.guild.id);
    const section = interaction.values[0];

    const embed = new EmbedBuilder().setColor(colors.primary).setTitle(`Configurações: ${section}`);

    if (section === 'automod') {
      embed.setDescription(
        `Anti-spam: ${settings.automod.antiSpam ? '✅' : '❌'}\n` +
          `Anti-links: ${settings.automod.antiLinks ? '✅' : '❌'}\n` +
          `Anti-convites: ${settings.automod.antiInvites ? '✅' : '❌'}\n` +
          `Anti-caps: ${settings.automod.antiCaps ? '✅' : '❌'}`
      );
    } else {
      embed.setDescription('Selecione uma opção para ver os detalhes.');
    }

    await interaction.update({ embeds: [embed] });
  },
};

export default handler;
