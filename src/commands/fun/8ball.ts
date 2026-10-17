import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { randomItem } from '../../utils/arrayUtils.js';
import { successEmbed } from '../../utils/embedUtils.js';

const answers = [
  'Com certeza!', 'Sim, definitivamente.', 'Sem dúvida.', 'Pode contar com isso.',
  'É provável.', 'Perspectiva boa.', 'Sim.', 'Os sinais apontam que sim.',
  'Resposta nebulosa, tente de novo.', 'Pergunte novamente mais tarde.',
  'Melhor não te contar agora.', 'Não consigo prever agora.',
  'Não conte com isso.', 'Minha resposta é não.', 'Minhas fontes dizem não.',
  'Perspectiva não muito boa.', 'Muito duvidoso.',
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Faça uma pergunta para a bola 8.')
    .addStringOption((opt) => opt.setName('pergunta').setDescription('Sua pergunta').setRequired(true)) as SlashCommandBuilder,
  category: 'fun',
  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString('pergunta', true);
    await interaction.reply({ embeds: [successEmbed(`🎱 ${randomItem(answers)}`, `Pergunta: ${question}`)] });
  },
};

export default command;
