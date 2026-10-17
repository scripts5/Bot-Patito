import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder().setName('invite').setDescription('Cria um convite para o canal atual.') as SlashCommandBuilder,
  category: 'utility',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.CreateInstantInvite],
  botPermissions: [PermissionFlagsBits.CreateInstantInvite],
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.channel || !('createInvite' in interaction.channel)) {
      await interaction.reply({ embeds: [errorEmbed('Não é possível criar convite nesse canal.')], ephemeral: true });
      return;
    }

    try {
      const invite = await interaction.channel.createInvite({ maxAge: 86400, maxUses: 0 });
      await interaction.reply({ embeds: [successEmbed(`Convite criado: ${invite.url}`)] });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Falha ao criar convite: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
