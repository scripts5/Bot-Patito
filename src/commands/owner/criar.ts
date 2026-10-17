import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { Command } from '../../types/command.js';
import { serverCreationService, storePendingPlan } from '../../services/serverCreationService.js';
import { colors } from '../../config/colors.js';
import { randomString } from '../../utils/stringUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('criar')
    .setDescription('[DONO] Cria/transforma o servidor automaticamente com base em um tema (cargos, canais, regras).')
    .addStringOption((opt) =>
      opt
        .setName('descricao')
        .setDescription('Descreva o tema do servidor. Ex: "Flamengo, jogos de futebol"')
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName('novo_nome').setDescription('Novo nome do servidor (deixe em branco para manter o atual)')
    ) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const description = interaction.options.getString('descricao', true);
    const newName = interaction.options.getString('novo_nome');

    const plan = serverCreationService.buildPlan(interaction.guild!.id, description, newName);
    const token = randomString(12);
    storePendingPlan(token, plan);

    const rolesList = plan.roles.map((r) => r.name).join(', ');
    const channelsList = plan.categories
      .map((cat) => `**${cat.name}**${cat.staffOnly ? ' 🔒' : ''}\n${cat.channels.map((c) => `• ${c.name}`).join('\n')}`)
      .join('\n\n');

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('📋 Prévia da criação do servidor')
      .setDescription(
        `**Tema detectado a partir de:** "${description}"\n` +
          `**Nome:** ${newName ? `${interaction.guild!.name} → **${newName}**` : `${interaction.guild!.name} (mantém o atual)`}`
      )
      .addFields(
        { name: `🎭 Cargos a criar (${plan.roles.length})`, value: rolesList.slice(0, 1024) },
        { name: '📂 Estrutura de canais', value: channelsList.slice(0, 1024) }
      )
      .setFooter({ text: 'Nada será criado até você confirmar. Duplicados são pulados automaticamente.' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`criar_confirmar_${token}`).setLabel('✅ Confirmar e criar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`criar_cancelar_${token}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

export default command;
