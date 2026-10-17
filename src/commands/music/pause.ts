import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { playerService } from '../../services/playerService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pausa a música atual.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const ok = playerService.pause(interaction.guild!.id);
    await interaction.reply({ embeds: [ok ? successEmbed('⏸️ Pausado.') : errorEmbed('Nada tocando no momento.')] });
  },
};

export default command;
