import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { formatTimestamp } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ginfo')
    .setDescription('Mostra detalhes de um sorteio.')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do sorteio').setRequired(true)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const giveaway = giveawayRepository.getById(id);

    if (!giveaway) {
      await interaction.reply({ embeds: [errorEmbed('Sorteio não encontrado.')], ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.gold)
      .setTitle(`🎁 ${giveaway.prize}`)
      .addFields(
        { name: 'Status', value: giveaway.ended ? 'Encerrado' : giveaway.paused ? 'Pausado' : 'Ativo', inline: true },
        { name: 'Vencedores', value: `${giveaway.winnersCount}`, inline: true },
        { name: 'Participantes', value: `${giveaway.participants.length}`, inline: true },
        { name: 'Host', value: `<@${giveaway.hostId}>`, inline: true },
        { name: 'Termina', value: formatTimestamp(giveaway.endsAt), inline: true }
      );

    if (giveaway.winners.length > 0) {
      embed.addFields({ name: 'Vencedores sorteados', value: giveaway.winners.map((w) => `<@${w}>`).join(', ') });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
