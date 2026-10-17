import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';
import { config } from '../../config.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('credits').setDescription('Mostra os créditos do bot.') as SlashCommandBuilder,
  category: 'info',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [infoEmbed(`${config.BOT_NAME} foi desenvolvido sob medida para uso privado. Todos os direitos reservados ao dono do bot.`, 'Créditos')],
    });
  },
};

export default command;
