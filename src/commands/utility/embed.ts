import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { isValidHexColor } from '../../utils/validators.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Envia um embed customizado no canal atual.')
    .addStringOption((opt) => opt.setName('titulo').setDescription('Título').setRequired(true))
    .addStringOption((opt) => opt.setName('descricao').setDescription('Descrição').setRequired(true))
    .addStringOption((opt) => opt.setName('cor').setDescription('Cor em hex, ex: #5865f2')) as SlashCommandBuilder,
  category: 'utility',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction: ChatInputCommandInteraction) {
    const title = interaction.options.getString('titulo', true);
    const description = interaction.options.getString('descricao', true);
    const colorInput = interaction.options.getString('cor');

    if (colorInput && !isValidHexColor(colorInput)) {
      await interaction.reply({ embeds: [errorEmbed('Cor inválida. Use formato hex, ex: #5865f2.')], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colorInput ? (parseInt(colorInput.replace('#', ''), 16) as number) : colors.primary)
      .setTitle(title)
      .setDescription(description);

    await (interaction.channel as TextChannel).send({ embeds: [embed] });
    await interaction.reply({ content: 'Embed enviado.', ephemeral: true });
  },
};

export default command;
