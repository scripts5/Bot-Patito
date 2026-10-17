import { EmbedBuilder } from 'discord.js';
import { SelectMenuHandlerModule } from '../../types/selectMenu.js';
import { colors } from '../../config/colors.js';
import { PatitoClient } from '../../types/command.js';

const handler: SelectMenuHandlerModule = {
  customId: 'help_category_select',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    const category = interaction.values[0];
    const client = interaction.client as PatitoClient;

    const commands = client.commands.filter((c) => c.category === category);
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Comandos: ${category}`)
      .setDescription(commands.map((c) => `\`/${c.data.name}\` — ${c.data.description}`).join('\n') || 'Nenhum comando nessa categoria.');

    await interaction.update({ embeds: [embed] });
  },
};

export default handler;
