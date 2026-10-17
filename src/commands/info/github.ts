import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('github').setDescription('Mostra o repositório do bot (se público).') as SlashCommandBuilder,
  category: 'info',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ embeds: [infoEmbed('Repositório privado — acesso restrito ao dono.', 'GitHub')], ephemeral: true });
  },
};

export default command;
