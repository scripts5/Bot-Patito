import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Define o modo lento do canal atual.')
    .addIntegerOption((opt) =>
      opt.setName('segundos').setDescription('0 a 21600 (0 desativa)').setRequired(true).setMinValue(0).setMaxValue(21600)
    ) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageChannels],
  botPermissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction: ChatInputCommandInteraction) {
    const seconds = interaction.options.getInteger('segundos', true);
    const channel = interaction.channel as TextChannel;

    try {
      await channel.setRateLimitPerUser(seconds);
      await interaction.reply({
        embeds: [successEmbed(seconds === 0 ? 'Modo lento desativado.' : `Modo lento definido para ${seconds}s.`, 'Slowmode')],
      });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao definir modo lento: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
