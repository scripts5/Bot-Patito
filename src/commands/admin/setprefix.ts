import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Define o prefixo do bot para esse servidor (uso futuro, comandos são via slash).')
    .addStringOption((opt) => opt.setName('prefixo').setDescription('Novo prefixo').setRequired(true).setMaxLength(5)) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const prefix = interaction.options.getString('prefixo', true);
    await serverConfigService.update(interaction.guild!.id, { prefix });
    await interaction.reply({ embeds: [successEmbed(`Prefixo definido: ${prefix}`)] });
  },
};

export default command;
