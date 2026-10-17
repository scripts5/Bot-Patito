import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('covid')
    .setDescription('Mostra estatísticas de COVID-19 de um país.')
    .addStringOption((opt) => opt.setName('pais').setDescription('Ex: Brazil, USA (padrão: all)')) as SlashCommandBuilder,
  category: 'utility',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const country = interaction.options.getString('pais') ?? 'all';
    await interaction.deferReply();

    try {
      const response = await fetch(`https://disease.sh/v3/covid-19/${country === 'all' ? 'all' : `countries/${encodeURIComponent(country)}`}`);
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as { cases?: number; deaths?: number; recovered?: number; todayCases?: number };

      await interaction.editReply({
        embeds: [
          successEmbed(
            `Casos: ${data.cases?.toLocaleString('pt-BR')}\nMortes: ${data.deaths?.toLocaleString('pt-BR')}\nRecuperados: ${data.recovered?.toLocaleString('pt-BR')}\nCasos hoje: ${data.todayCases?.toLocaleString('pt-BR')}`,
            `COVID-19: ${country}`
          ),
        ],
      });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Não foi possível obter dados: ${(err as Error).message}`)] });
    }
  },
};

export default command;
