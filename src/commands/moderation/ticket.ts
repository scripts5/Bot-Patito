import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Envia o painel de abertura de tickets no canal atual.') as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('🎫 Central de Suporte')
      .setDescription('Clique no botão abaixo para abrir um ticket com a nossa equipe.');

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('ticket_open').setLabel('Abrir ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary)
    );

    await (interaction.channel as TextChannel).send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'Painel de tickets enviado.', ephemeral: true });
  },
};

export default command;
