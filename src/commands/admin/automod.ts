import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('Ativa/desativa regras do automod.')
    .addStringOption((opt) =>
      opt
        .setName('regra')
        .setDescription('Regra a alternar')
        .setRequired(true)
        .addChoices(
          { name: 'Anti-spam', value: 'antiSpam' },
          { name: 'Anti-links', value: 'antiLinks' },
          { name: 'Anti-convites', value: 'antiInvites' },
          { name: 'Anti-caps', value: 'antiCaps' }
        )
    )
    .addBooleanOption((opt) => opt.setName('ativado').setDescription('true para ativar, false para desativar').setRequired(true)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const rule = interaction.options.getString('regra', true) as 'antiSpam' | 'antiLinks' | 'antiInvites' | 'antiCaps';
    const enabled = interaction.options.getBoolean('ativado', true);

    const settings = serverConfigService.getSettings(interaction.guild!.id);
    await serverConfigService.update(interaction.guild!.id, {
      automod: { ...settings.automod, [rule]: enabled },
    });

    await interaction.reply({ embeds: [successEmbed(`Regra "${rule}" ${enabled ? 'ativada' : 'desativada'}.`)] });
  },
};

export default command;
