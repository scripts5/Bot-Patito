import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { config } from '../../config.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('status').setDescription('Mostra o status atual do bot.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    const embed = new EmbedBuilder()
      .setColor(colors.success)
      .setTitle('🟢 Online')
      .addFields(
        { name: 'Latência', value: `${Math.round(client.ws.ping)}ms`, inline: true },
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'IA disponível', value: config.XAI_API_KEY ? '✅' : '❌', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
