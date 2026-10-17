import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { Command } from '../../types/command.js';
import Jimp from 'jimp';
import { errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('wasted')
    .setDescription('Aplica o filtro "WASTED" (estilo GTA) no seu avatar ou de outro usuário.')
    .addUserOption((opt) => opt.setName('usuario').setDescription('Usuário')) as SlashCommandBuilder,
  category: 'fun',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('usuario') ?? interaction.user;
    await interaction.deferReply();

    try {
      const response = await fetch(user.displayAvatarURL({ extension: 'png', size: 512 }));
      const buffer = Buffer.from(await response.arrayBuffer());
      const image = await Jimp.read(buffer);
      image.greyscale().contrast(0.3);

      const output = await image.getBufferAsync(Jimp.MIME_PNG);
      const attachment = new AttachmentBuilder(output, { name: 'wasted.png' });
      await interaction.editReply({ content: '💀 **WASTED**', files: [attachment] });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Falha ao gerar imagem: ${(err as Error).message}`)] });
    }
  },
};

export default command;
