import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { randomInt } from '../../utils/mathUtils.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Calcula a compatibilidade entre duas pessoas.')
    .addUserOption((opt) => opt.setName('pessoa1').setDescription('Primeira pessoa').setRequired(true))
    .addUserOption((opt) => opt.setName('pessoa2').setDescription('Segunda pessoa').setRequired(true)) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const p1 = interaction.options.getUser('pessoa1', true);
    const p2 = interaction.options.getUser('pessoa2', true);
    const percent = randomInt(0, 100);
    const bar = '💗'.repeat(Math.round(percent / 10)) + '🤍'.repeat(10 - Math.round(percent / 10));
    await interaction.reply({ embeds: [successEmbed(`${p1} + ${p2} = **${percent}%**\n${bar}`, '💘 Ship')] });
  },
};

export default command;
