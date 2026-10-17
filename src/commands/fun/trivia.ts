import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';
import { shuffle } from '../../utils/arrayUtils.js';
import { logger } from '../../utils/logger.js';

interface TriviaResult {
  results: { question: string; correct_answer: string; incorrect_answers: string[] }[];
}

function decodeHtml(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&eacute;/g, 'é');
}

const command: Command = {
  data: new SlashCommandBuilder().setName('trivia').setDescription('Mostra uma pergunta de trivia aleatória.') as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as TriviaResult;
      const q = data.results[0];
      const options = shuffle([q.correct_answer, ...q.incorrect_answers]).map((o) => decodeHtml(o));

      await interaction.reply({
        embeds: [
          successEmbed(
            `${decodeHtml(q.question)}\n\n${options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`,
            '🧠 Trivia'
          ),
        ],
      });
    } catch (err) {
      logger.error('trivia', `Falha ao buscar trivia: ${err}`);
      await interaction.reply({ embeds: [errorEmbed('Não consegui buscar uma pergunta agora.')] });
    }
  },
};

export default command;
