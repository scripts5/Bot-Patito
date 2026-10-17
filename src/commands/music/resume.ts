import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { playerService } from '../../services/playerService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('resume').setDescription('Retoma a música pausada.') as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const ok = playerService.resume(interaction.guild!.id);
    await interaction.reply({ embeds: [ok ? successEmbed('▶️ Retomado.') : errorEmbed('Nada pausado no momento.')] });
  },
};

export default command;
