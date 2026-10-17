import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { readJson, writeJson } from '../../database/jsonDatabase.js';
import { Giveaway } from '../../types/giveaway.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('gdelete')
    .setDescription('Apaga um sorteio sem sortear vencedores.')
    .addStringOption((opt) => opt.setName('id').setDescription('ID do sorteio').setRequired(true)) as SlashCommandBuilder,
  category: 'giveaway',
  guildOnly: true,
  userPermissions: [PermissionFlagsBits.ManageGuild],
  async execute(interaction: ChatInputCommandInteraction) {
    const id = interaction.options.getString('id', true);
    const all = readJson<Giveaway[]>('giveaways', []);
    const next = all.filter((g) => g.id !== id);

    if (next.length === all.length) {
      await interaction.reply({ embeds: [errorEmbed('Sorteio não encontrado.')], ephemeral: true });
      return;
    }

    await writeJson('giveaways', next);
    await interaction.reply({ embeds: [successEmbed('Sorteio apagado.')] });
  },
};

export default command;
