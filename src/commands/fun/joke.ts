import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('joke').setDescription('Conta uma piada aleatória.') as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const response = await fetch('https://v2.jokeapi.dev/joke/Any?lang=pt&safe-mode');
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as { type: string; joke?: string; setup?: string; delivery?: string };

      const text = data.type === 'single' ? data.joke! : `${data.setup}\n\n${data.delivery}`;
      await interaction.reply({ embeds: [successEmbed(text, '😂 Piada')] });
    } catch (err) {
      logger.error('joke', `Falha ao buscar piada: ${err}`);
      await interaction.reply({ embeds: [errorEmbed('Não consegui buscar uma piada agora. Tente novamente.')] });
    }
  },
};

export default command;
