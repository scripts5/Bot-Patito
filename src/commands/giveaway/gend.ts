import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { giveawayService } from '../../services/giveawayService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('gend')
    .setDescription('Encerra um sorteio imediatamente e sorteia os vencedores.')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do sorteio').setRequired(true)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const giveaway = giveawayRepository.getById(id);

    if (!giveaway || giveaway.ended) {
      await interaction.reply({ embeds: [errorEmbed('Sorteio não encontrado ou já encerrado.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const result = await giveawayService.end(interaction.guild!, id);
    await interaction.editReply({
      embeds: [successEmbed(result?.winners.length ? `Vencedores: ${result.winners.map((w) => `<@${w}>`).join(', ')}` : 'Nenhum participante.')],
    });
  },
};

export default command;
