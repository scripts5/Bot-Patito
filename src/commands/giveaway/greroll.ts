import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { randomItem } from '../../utils/arrayUtils.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('greroll')
    .setDescription('Sorteia um novo vencedor para um sorteio já encerrado.')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do sorteio').setRequired(true)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const giveaway = giveawayRepository.getById(id);

    if (!giveaway || !giveaway.ended) {
      await interaction.reply({ embeds: [errorEmbed('Sorteio não encontrado ou ainda não foi encerrado.')], ephemeral: true });
      return;
    }
    if (giveaway.participants.length === 0) {
      await interaction.reply({ embeds: [errorEmbed('Esse sorteio não teve participantes.')], ephemeral: true });
      return;
    }

    const newWinner = randomItem(giveaway.participants);
    await giveawayRepository.update(id, { winners: [...giveaway.winners, newWinner] });

    const channel = interaction.guild!.channels.cache.get(giveaway.channelId) as TextChannel | undefined;
    await channel?.send(`🎉 Novo vencedor do reroll de **${giveaway.prize}**: <@${newWinner}>!`).catch(() => undefined);

    await interaction.reply({ embeds: [successEmbed(`Novo vencedor: <@${newWinner}>`)] });
  },
};

export default command;
