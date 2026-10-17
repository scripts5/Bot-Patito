import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Mostra o banner de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário (padrão: você)')) as SlashCommandBuilder,
  category: 'utility',
  async execute(interaction: ChatInputCommandInteraction) {
    const user = await interaction.client.users.fetch(interaction.options.getUser('usuario')?.id ?? interaction.user.id, { force: true });

    if (!user.banner) {
      await interaction.reply({ embeds: [errorEmbed(`${user.tag} não tem banner definido.`)] });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Banner de ${user.tag}`)
      .setImage(user.bannerURL({ size: 1024 })!);

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
