import { SelectMenuHandlerModule } from '../../types/selectMenu.js';

// Alias reaproveitado pelo painel de ajuda; delega ao mesmo comportamento de categorias.
const handler: SelectMenuHandlerModule = {
  customId: 'category_select_menu',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    await interaction.reply({ content: `Categoria selecionada: ${interaction.values[0]}`, ephemeral: true });
  },
};

export default handler;
