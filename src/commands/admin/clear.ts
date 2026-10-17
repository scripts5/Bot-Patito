import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { moderacaoService } from '../../services/moderacaoService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Apaga mensagens em massa no canal.')
    .addIntegerOption((opt) => opt.setName('quantidade').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100))
    .addUserOption((opt) => opt.setName('usuario').setDescription('Apagar só mensagens desse usuário')) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageMessages],
  botPermissions: [PermissionFlagsBits.ManageMessages],
  async execute(interaction: ChatInputCommandInteraction) {
    const amount = interaction.options.getInteger('quantidade', true);
    const user = interaction.options.getUser('usuario');
    const channel = interaction.channel as TextChannel;

    await interaction.deferReply({ ephemeral: true });
    const result = await moderacaoService.purge(channel, amount, user ? (m) => m.author.id === user.id : undefined);

    await interaction.editReply({
      embeds: [result.ok ? successEmbed(result.message, 'Limpeza') : errorEmbed(result.message, 'Limpeza falhou')],
    });
  },
};

export default command;
