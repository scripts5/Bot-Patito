import { SlashCommandBuilder, ChatInputCommandInteraction, codeBlock } from 'discord.js';
import { Command } from '../../types/command.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { truncate } from '../../utils/stringUtils.js';

/**
 * Comando de dono para avaliar expressões JS simples em runtime (debug).
 * ATENÇÃO: só o dono do bot pode usar (ownerOnly). Ainda assim, evite compartilhar
 * acesso ao bot com terceiros — esse comando executa código arbitrário no processo do bot.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('[DONO] Avalia uma expressão JavaScript (debug).')
    .addStringOption((opt) => opt.setName('codigo').setDescription('Código a avaliar').setRequired(true)) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const code = interaction.options.getString('codigo', true);

    try {
      // eslint-disable-next-line no-eval
      let result = eval(code);
      if (result instanceof Promise) result = await result;

      const output = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      await interaction.reply({ content: codeBlock('js', truncate(output ?? 'undefined', 1900)), ephemeral: true });
    } catch (err) {
      await interaction.reply({ embeds: [errorEmbed(`Erro: ${(err as Error).message}`)], ephemeral: true });
    }
  },
};

export default command;
