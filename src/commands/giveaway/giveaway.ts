import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { giveawayService } from '../../services/giveawayService.js';
import { parseDuration } from '../../utils/timeUtils.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Inicia um sorteio no canal atual.')
    .addStringOption((opt) => opt.setName('premio').setDescription('O que será sorteado').setRequired(true))
    .addStringOption((opt) => opt.setName('duracao').setDescription('Ex: 1h, 1d, 30m').setRequired(true))
    .addIntegerOption((opt) => opt.setName('vencedores').setDescription('Número de vencedores').setMinValue(1)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const prize = interaction.options.getString('premio', true);
    const durationStr = interaction.options.getString('duracao', true);
    const winnersCount = interaction.options.getInteger('vencedores') ?? 1;
    const durationMs = parseDuration(durationStr);

    if (!durationMs) {
      await interaction.reply({ embeds: [errorEmbed('Duração inválida. Use algo como 1h, 1d ou 30m.')], ephemeral: true });
      return;
    }

    const endsAt = Date.now() + durationMs;
    const giveaway = await giveawayRepository.create({
      guildId: interaction.guild!.id,
      channelId: interaction.channelId,
      messageId: null,
      prize,
      winnersCount,
      hostId: interaction.user.id,
      endsAt,
    });

    const embed = giveawayService.buildEmbed(prize, winnersCount, endsAt, interaction.user.tag, 0);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`giveaway_join_${giveaway.id}`).setLabel('🎉 Participar').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
    const sent = await interaction.fetchReply();
    await giveawayRepository.update(giveaway.id, { messageId: sent.id });
  },
};

export default command;
