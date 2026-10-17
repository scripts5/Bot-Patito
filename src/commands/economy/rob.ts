import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { economyService } from '../../services/economyService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Tenta roubar moedas de outro usuário (risco de multa).')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Alvo').setRequired(true)) as SlashCommandBuilder,
  category: 'economy',
  guildOnly: true,
  cooldown: 60,
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const result = await economyService.rob(interaction.guild!.id, interaction.user.id, target.id);
    await interaction.reply({ embeds: [result.ok ? successEmbed(result.message, '💰 Roubo bem-sucedido') : errorEmbed(result.message, 'Roubo falhou')] });
  },
};

export default command;
