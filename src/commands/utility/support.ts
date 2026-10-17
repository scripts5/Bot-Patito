import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';
import { config } from '../../config.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('support').setDescription('Mostra como entrar em contato com o suporte.') as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [infoEmbed(`Esse é um bot privado. Para suporte, entre em contato com o dono (<@${config.OWNER_ID}>).`, 'Suporte')],
      ephemeral: true,
    });
  },
};

export default command;
