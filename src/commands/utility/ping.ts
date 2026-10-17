import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Mostra a latência do bot.') as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({ content: 'Calculando...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
      content: null,
      embeds: [successEmbed(`🏓 Latência do bot: **${latency}ms**\n📡 Latência da API: **${apiLatency}ms**`, 'Pong!')],
    });
  },
};

export default command;
