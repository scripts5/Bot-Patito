import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Apaga mensagens em massa (alias avançado de /clear).')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))
    .addBooleanOption((opt) => opt.setName('somente_bots').setDescription('Apagar só mensagens de bots')) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const onlyBots = interaction.options.getBoolean('somente_bots') ?? false;
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });
    const result = await moderacaoService.purge(channel, amount, onlyBots ? (m) => m.author.bot : undefined);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Purge') : errorEmbed(result.message, 'Purge falhou')],
    });
  },
};

export default command;
