import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { serverConfigService } from '../../services/serverConfigService.js';
import { colors } from '../../config/colors.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('settings').setDescription('Mostra as configurações atuais do servidor.') as SlashCommandBuilder,
  category: 'admin',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const s = serverConfigService.getSettings(interaction.guild!.id);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('⚙️ Configurações do servidor')
      .addFields(
        { name: 'Prefixo', value: s.prefix, inline: true },
        { name: 'Idioma', value: s.language, inline: true },
        { name: 'Anti-raid', value: s.antiRaid ? '✅' : '❌', inline: true },
        { name: 'Canal de logs', value: s.modLogChannelId ? `<#${s.modLogChannelId}>` : 'Não definido', inline: true },
        { name: 'Boas-vindas', value: s.welcomeChannelId ? `<#${s.welcomeChannelId}>` : 'Não definido', inline: true },
        { name: 'Despedidas', value: s.goodbyeChannelId ? `<#${s.goodbyeChannelId}>` : 'Não definido', inline: true },
        { name: 'Autorole', value: s.autoroleId ? `<@&${s.autoroleId}>` : 'Não definido', inline: true },
        {
          name: 'Automod',
          value: `Spam: ${s.automod.antiSpam ? '✅' : '❌'} | Links: ${s.automod.antiLinks ? '✅' : '❌'} | Convites: ${s.automod.antiInvites ? '✅' : '❌'} | Caps: ${s.automod.antiCaps ? '✅' : '❌'}`,
        },
        {
          name: 'Tema detectado automaticamente',
          value: s.theme && s.theme !== 'default' ? `${s.theme} (${s.themeConfidence}% de confiança)` : 'Não identificado',
        },
        {
          name: 'Outros bots no servidor',
          value: s.detectedBots.length > 0 ? s.detectedBots.map((b) => `${b.name}${b.features.length ? ` (${b.features.join(', ')})` : ''}`).join(', ') : 'Nenhum detectado',
        },
        {
          name: 'Funções assumidas pelo Patito',
          value: `Boas-vindas: ${s.features.welcome ? '✅' : '⏭️ (outro bot)'} | Despedida: ${s.features.goodbye ? '✅' : '⏭️ (outro bot)'} | Níveis: ${s.features.leveling ? '✅' : '⏭️ (outro bot)'}`,
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
