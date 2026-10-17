import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { randomItem } from '../../utils/arrayUtils.js';
import { successEmbed } from '../../utils/embedUtils.js';

const options = ['pedra', 'papel', 'tesoura'] as const;

function decide(user: string, bot: string): string {
  if (user === bot) return 'Empate!';
  const wins: Record<string, string> = { pedra: 'tesoura', tesoura: 'papel', papel: 'pedra' };
  return wins[user] === bot ? 'Você venceu!' : 'Eu venci!';
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Jogue pedra, papel ou tesoura contra o bot.')
    .addStringOption((opt) =>
      opt
        .setName('escolha')
        .setDescription('Sua escolha')
        .setRequired(true)
        .addChoices({ name: 'Pedra', value: 'pedra' }, { name: 'Papel', value: 'papel' }, { name: 'Tesoura', value: 'tesoura' })
    ) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const userChoice = interaction.options.getString('escolha', true);
    const botChoice = randomItem([...options]);
    await interaction.reply({ embeds: [successEmbed(`Você: **${userChoice}** | Bot: **${botChoice}**\n${decide(userChoice, botChoice)}`, '🪨📄✂️')] });
  },
};

export default command;
