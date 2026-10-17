import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { config } from '../../config.js';
import { msToHuman } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('botinfo').setDescription('Mostra informações técnicas sobre o bot.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(config.BOT_NAME)
      .addFields(
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Comandos', value: `${client.commands.size}`, inline: true },
        { name: 'Uptime', value: msToHuman(client.uptime ?? 0), inline: true },
        { name: 'Memória usada', value: `${memory.toFixed(1)} MB`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'discord.js', value: 'v14', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
