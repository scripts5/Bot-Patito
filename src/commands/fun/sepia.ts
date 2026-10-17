import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import { imageEffectsService } from '../../services/imageEffectsService.js';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('sepia')
    .setDescription('Aplica o efeito sepia no seu avatar ou de outro usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'fun',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    await interaction.deferReply();

    try {
      const buffer = await imageEffectsService.sepia(user.displayAvatarURL({ extension: 'png', size: 512 }));
      const attachment = new AttachmentBuilder(buffer, { name: 'sepia.png' });
      await interaction.editReply({ files: [attachment] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed((err as Error).message)] });
    }
  },
};

export default command;
