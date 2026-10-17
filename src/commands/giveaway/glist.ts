import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { giveawayRepository } from '../../database/repositories/giveawayRepository.js';
import { colors } from '../../config/colors.js';
import { formatTimestamp } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('glist').setDescription('Lista os sorteios ativos do servidor.') as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const active = giveawayRepository.listByGuild(interaction.guild!.id).filter((g) => !g.ended);

    if (active.length === 0) {
      await interaction.reply('Nenhum sorteio ativo no momento.');
      return;
    }

    const description = active.map((g) => `\`${g.id}\` — **${g.prize}** (termina ${formatTimestamp(g.endsAt)})`).join('\n');
    await interaction.reply({ embeds: [new EmbedBuilder().setColor(colors.gold).setTitle('🎁 Sorteios ativos').setDescription(description)] });
  },
};

export default command;
