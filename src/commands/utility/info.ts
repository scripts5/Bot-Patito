import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { config } from '../../config.js';
import { msToHuman } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('info').setDescription('Mostra informações sobre o Patito.') as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`${config.BOT_NAME} — Bot completo para Discord`)
      .addFields(
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Comandos', value: `${client.commands.size}`, inline: true },
        { name: 'Uptime', value: msToHuman(client.uptime ?? 0), inline: true },
        { name: 'Biblioteca', value: 'discord.js v14', inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
