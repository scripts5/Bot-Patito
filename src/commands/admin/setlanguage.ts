import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { successEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('setlanguage')
    .setDescription('Define o idioma do bot para esse servidor.')
    .addStringOption((opt) =>
      opt.setName('idioma').setDescription('Idioma').setRequired(true).addChoices({ name: 'Português (BR)', value: 'pt-BR' }, { name: 'English', value: 'en-US' })
    ) as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const language = interaction.options.getString('idioma', true);
    await serverConfigService.update(interaction.guild!.id, { language });
    await interaction.reply({ embeds: [successEmbed(`Idioma definido: ${language}`)] });
  },
};

export default command;
