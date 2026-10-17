import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setantiraid')
    .setDescription('Ativa/desativa a proteção anti-raid.')
    .addBooleanOption((opt) => opt.setName('ativado').setDescription('true/false').setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const enabled = interaction.options.getBoolean('ativado', true);
    await serverConfigService.update(interaction.guild!.id, { antiRaid: enabled });
    await interaction.reply({ embeds: [successEmbed(`Anti-raid ${enabled ? 'ativado' : 'desativado'}.`)] });
  },
};

export default command;
