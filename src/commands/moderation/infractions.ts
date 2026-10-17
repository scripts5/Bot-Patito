import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { warningService } from '../../services/warningService.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('infractions')
    .setDescription('Lista todas as advertências ativas de um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const warnings = warningService.list(interaction.guild!.id, target.id);

    if (warnings.length === 0) {
      await interaction.reply({ embeds: [errorEmbed(`${target.tag} não tem advertências ativas.`)] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.warning)
      .setTitle(`Advertências de ${target.tag}`)
      .setDescription(warnings.map((w) => `\`${w.id}\` • ${w.reason} • <t:${Math.floor(w.createdAt / 1000)}:R>`).join('\n'));

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
