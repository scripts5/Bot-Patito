import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { caseRepository } from '../../database/repositories/caseRepository.js';
import { readJson, writeJson } from '../../database/jsonDatabase.js';
import { ModerationCase } from '../../types/case.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('reason')
    .setDescription('Edita o motivo de um caso de moderação existente.')
    .addIntegerOption((opt) => opt.setName('numero').setDescription('Número do caso').setRequired(true))
    .addStringOption((opt) => opt.setName('novo_motivo').setDescription('Novo motivo').setRequired(true)) as SlashCommandBuilder,
  category: 'moderation',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction: ChatInputCommandInteraction) {
    const caseId = interaction.options.getInteger('numero', true);
    const newReason = interaction.options.getString('novo_motivo', true);

    const existing = caseRepository.getByCaseId(interaction.guild!.id, caseId);
    if (!existing) {
      await interaction.reply({ embeds: [errorEmbed('Caso não encontrado.')], ephemeral: true });
      return;
    }

    const all = readJson<ModerationCase[]>('cases', []);
    const idx = all.findIndex((c) => c.guildId === interaction.guild!.id && c.caseId === caseId);
    all[idx].reason = newReason;
    await writeJson('cases', all);

    await interaction.reply({ embeds: [successEmbed(`Motivo do caso #${caseId} atualizado.`)] });
  },
};

export default command;
