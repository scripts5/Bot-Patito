import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed } from '../../utils/embedUtils.js';
import { logger } from '../../utils/logger.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('Denuncia um usuário para a equipe de moderação.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário denunciado').setRequired(true))
    .addStringOption((opt) => opt.setName('motivo').setDescription('Motivo da denúncia').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  cooldown: 30,
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const reason = interaction.options.getString('motivo', true);

    logger.moderation(`report guild=${interaction.guild!.id} by=${interaction.user.id} target=${target.id} reason="${reason}"`);

    await interaction.reply({ embeds: [successEmbed('Denúncia enviada para a equipe de moderação. Obrigado.')], ephemeral: true });
  },
};

export default command;
