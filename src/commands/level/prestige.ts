import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { levelRepository } from '../../database/repositories/levelRepository.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const MIN_LEVEL_FOR_PRESTIGE = 50;

const command: Command = {
  data: new SlashCommandBuilder().setName('prestige').setDescription(`Reseta seu nível para +1 de prestígio (requer nível ${MIN_LEVEL_FOR_PRESTIGE}+).`) as SlashCommandBuilder,
  category: 'level',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const account = levelRepository.get(interaction.guild!.id, interaction.user.id);

    if (account.level < MIN_LEVEL_FOR_PRESTIGE) {
      await interaction.reply({
        embeds: [errorEmbed(`Você precisa estar no nível ${MIN_LEVEL_FOR_PRESTIGE} para prestigiar. Nível atual: ${account.level}.`)],
        ephemeral: true,
      });
      return;
    }

    await levelRepository.update(interaction.guild!.id, interaction.user.id, {
      level: 0,
      xp: 0,
      prestige: account.prestige + 1,
    });

    await interaction.reply({ embeds: [successEmbed(`Parabéns! Você agora é Prestígio **${account.prestige + 1}**.`)] });
  },
};

export default command;
