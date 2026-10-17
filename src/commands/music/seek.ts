import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Avança para um ponto específico da música atual (em segundos).')
    .addIntegerOption((opt) => opt.setName('segundos').setDescription('Segundo alvo').setRequired(true).setMinValue(0)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    // @discordjs/voice não suporta seek nativo em streams — seria necessário reiniciar o stream
    // a partir do timestamp desejado via play-dl (stream com opção seek). Deixado como ponto de
    // extensão: implementar quando a lib de streaming suportar range de forma estável.
    await interaction.reply({
      embeds: [errorEmbed('Avançar para um ponto específico ainda não é suportado nesta versão. Use /skip para pular a música.')],
      ephemeral: true,
    });
  },
};

export default command;
