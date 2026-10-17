import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Mostra a previsão do tempo de uma cidade.')
    .addStringOption((opt) => opt.setName('cidade').setDescription('Nome da cidade').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const city = interaction.options.getString('cidade', true);
    await interaction.deferReply();

    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+(sensação+%f)+umidade:+%h+vento:+%w`);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const text = await response.text();
      await interaction.editReply({ embeds: [successEmbed(text, `Clima em ${city}`)] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Não foi possível obter o clima: ${(err as Error).message}`)] });
    }
  },
};

export default command;
