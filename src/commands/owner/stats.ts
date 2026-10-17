import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command, PatitoClient } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { msToHuman } from '../../utils/timeUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('stats').setDescription('[DONO] Estatísticas detalhadas do bot.') as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const client = interaction.client as PatitoClient;
    const memory = process.memoryUsage();

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('📊 Estatísticas do sistema')
      .addFields(
        { name: 'Uptime', value: msToHuman(client.uptime ?? 0), inline: true },
        { name: 'Servidores', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Usuários (cache)', value: `${client.users.cache.size}`, inline: true },
        { name: 'Comandos', value: `${client.commands.size}`, inline: true },
        { name: 'Heap usado', value: `${(memory.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: 'RSS', value: `${(memory.rss / 1024 / 1024).toFixed(1)} MB`, inline: true }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;
