import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Command } from '../../types/command.js';
import { colors } from '../../config/colors.js';
import { formatDate } from '../../utils/dateUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Mostra informações de um usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário (padrão: você)')) as SlashCommandBuilder,
  category: 'utility',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    const member = interaction.options.getMember('usuario') as GuildMember | null ?? (await interaction.guild!.members.fetch(interaction.user.id));

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle(`Informações de ${user.tag}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Conta criada em', value: formatDate(user.createdAt), inline: true },
        { name: 'Entrou no servidor em', value: member?.joinedAt ? formatDate(member.joinedAt) : 'Desconhecido', inline: true },
        { name: 'Cargos', value: member ? member.roles.cache.map((r) => r.toString()).join(', ').slice(0, 1000) || 'Nenhum' : 'N/A' }
      );

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
