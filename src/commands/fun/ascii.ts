import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageEffectsService } from '../../services/imageEffectsService.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('Converte seu avatar (ou de outro usuário) em arte ASCII.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'fun',
  cooldown: 8,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    await interaction.deferReply();

    try {
      const art = await imageEffectsService.ascii(user.displayAvatarURL({ extension: 'png', size: 256 }));
      await interaction.editReply({ content: art.length <= 2000 ? art : art.slice(0, 1990) + '\n```' });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
