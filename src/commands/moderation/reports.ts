import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { infoEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reports')
    .setDescription('Mostra as denúncias recentes (consulte o arquivo de logs de moderação).') as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      embeds: [infoEmbed('As denúncias ficam registradas em `logs/moderation.log`. Em breve: listagem via painel.', 'Denúncias')],
      ephemeral: true,
    });
  },
};

export default command;
