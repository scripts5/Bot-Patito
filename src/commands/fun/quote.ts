import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('quote').setDescription('Mostra uma citação inspiradora aleatória.') as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const response = await fetch('https://api.quotable.io/random');
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as { content: string; author: string };
      await interaction.reply({ embeds: [successEmbed(`"${data.content}"\n— ${data.author}`, '💭 Citação')] });
    } catch (err) {
      logger.error('quote', `Falha ao buscar citação: ${err}`);
      await interaction.reply({ embeds: [errorEmbed('Não consegui buscar uma citação agora.')] });
    }
  },
};

export default command;
