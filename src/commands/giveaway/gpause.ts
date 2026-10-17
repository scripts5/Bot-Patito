import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('gpause')
    .setDescription('Pausa um sorteio (não encerra automaticamente enquanto pausado).')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do sorteio').setRequired(true)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const updated = await giveawayRepository.update(id, { paused: true });
    await interaction.reply({ embeds: [updated ? successEmbed('Sorteio pausado.') : errorEmbed('Sorteio não encontrado.')] });
  },
};

export default command;
