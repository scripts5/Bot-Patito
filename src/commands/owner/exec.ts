import { SlashCommandBuilder, ChatInputCommandInteraction, codeBlock } from 'discord.js';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Command } from '../../types/command.js';
import { errorEmbed } from '../../utils/embedUtils.js';
import { truncate } from '../../utils/stringUtils.js';

const execAsync = promisify(exec);

/**
 * Executa um comando de shell no servidor onde o bot roda. Uso restrito ao dono.
 * ATENÇÃO: alto risco — só use se confiar totalmente em quem tem acesso ao Discord do dono.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName('exec')
    .setDescription('[DONO] Executa um comando de shell no servidor do bot.')
    .addStringOption((opt) => opt.setName('comando').setDescription('Comando shell').setRequired(true)) as SlashCommandBuilder,
  category: 'owner',
  ownerOnly: true,
  async execute(interaction: ChatInputCommandInteraction) {
    const cmd = interaction.options.getString('comando', true);
    await interaction.deferReply({ ephemeral: true });

    try {
      const { stdout, stderr } = await execAsync(cmd, { timeout: 15_000 });
      const output = stdout || stderr || '(sem saída)';
      await interaction.editReply({ content: codeBlock('bash', truncate(output, 1900)) });
    } catch (err) {
      await interaction.editReply({ embeds: [errorEmbed(`Erro: ${(err as Error).message}`)] });
    }
  },
};

export default command;
