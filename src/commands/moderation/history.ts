import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { caseService } from '../../services/caseService.js';
import { warningService } from '../../services/warningService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('Mostra o histórico de moderação de um membro.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const cases = caseService.listByGuild(interaction.guild!.id).filter((c) => c.targetId === target.id);
    const warnings = warningService.list(interaction.guild!.id, target.id);

    const embed = new EmbedBuilder()
      .setColor(colors.neutral)
      .setTitle(`Histórico de ${target.tag}`)
      .addFields(
        { name: 'Total de casos', value: `${cases.length}`, inline: true },
        { name: 'Advertências ativas', value: `${warnings.length}`, inline: true },
        {
          name: 'Últimos casos',
          value: cases.slice(-5).reverse().map((c) => `#${c.caseId} • ${c.type} • ${c.reason.slice(0, 40)}`).join('\n') || 'Nenhum',
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
