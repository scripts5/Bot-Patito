import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../../types/command.js';
import { successEmbed, errorEmbed } from '../../utils/embedUtils.js';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('Traduz um texto (via serviço público de tradução).')
    .addStringOption((opt) => opt.setName('texto').setDescription('Texto a traduzir').setRequired(true))
    .addStringOption((opt) => opt.setName('idioma_destino').setDescription('Código do idioma, ex: en, pt, es').setRequired(true)) as SlashCommandBuilder,
  category: 'utility',
  cooldown: 5,
  async execute(interaction: ChatInputCommandInteraction) {
    const text = interaction.options.getString('texto', true);
    const target = interaction.options.getString('idioma_destino', true);

    await interaction.deferReply();

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${encodeURIComponent(target)}`
      );
      if (!response.ok) throw new Error(`status ${response.status}`);
      const data = (await response.json()) as { responseData?: { translatedText?: string } };
      const translated = data.responseData?.translatedText;

      if (!translated) throw new Error('resposta vazia');

      await interaction.editReply({ embeds: [successEmbed(translated, 'Tradução')] });
    } catch (err) {
      await interaction.editReply({
        embeds: [errorEmbed(`Serviço de tradução indisponível no momento: ${(err as Error).message}`)],
      });
    }
  },
};

export default command;
