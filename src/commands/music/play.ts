import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../types/command.js';
import { musicService } from '../../services/musicService.js';
import { queueService } from '../../services/queueService.js';
import { playerService } from '../../services/playerService.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca uma música (link ou busca no YouTube).')
    .addStringOption((opt) => opt.setName('busca').setDescription('Nome da música ou link').setRequired(true)) as SlashCommandBuilder,
  category: 'music',
  guildOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply({ embeds: [errorEmbed('Você precisa estar em um canal de voz.')], ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const query = interaction.options.getString('busca', true);
    const track = await musicService.resolve(query);

    if (!track) {
      await interaction.editReply({ embeds: [errorEmbed('Não encontrei nada com essa busca/link.')] });
      return;
    }
    track.requestedBy = interaction.user.id;

    try {
      await musicService.join(voiceChannel, interaction.channelId);
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
      return;
    }

    queueService.add(interaction.guild!.id, track);

    if (!playerService.isPlaying(interaction.guild!.id)) {
      await musicService.playNext(interaction.guild!.id).catch(async (err) => {
        await interaction.followUp({ embeds: [errorEmbed((err as Error).message)] });
      });
      await interaction.editReply({ embeds: [successEmbed(`🎶 Tocando agora: **${track.title}**`)] });
    } else {
      await interaction.editReply({ embeds: [successEmbed(`Adicionado à fila: **${track.title}**`)] });
    }
  },
};

export default command;
