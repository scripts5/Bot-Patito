import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { colors } from '../config/colors.js';
import { aiService } from './aiService.js';
import { ApplyResult, ProposalGroup, ServerProposal } from './serverProposalService.js';
import { truncate } from '../utils/stringUtils.js';

const GROUP_TITLE: Record<ProposalGroup, string> = {
  config: '⚙️ Configurações',
  rules: '📜 Regras',
  create: '➕ Criar o que falta',
  improve: '✨ Melhorias (mexem no que já existe)',
};
const GROUP_ORDER: ProposalGroup[] = ['config', 'rules', 'create', 'improve'];
const GROUP_EMOJI: Record<ProposalGroup, string> = { config: '⚙️', rules: '📜', create: '➕', improve: '✨' };

const SOURCE_LABEL = { ia: 'gerado por IA', modelo: 'gerado pelo Patito', editado: 'editado por você' } as const;

export const PROPOSAL_NOT_OWNER = 'Só o dono do bot pode mexer nessa proposta.';
export const PROPOSAL_EXPIRED = '⏰ Essa proposta expirou ou já foi usada. Rode `/autoconfig analisar` para gerar outra.';

type ProposalComponents = (ActionRowBuilder<StringSelectMenuBuilder> | ActionRowBuilder<ButtonBuilder>)[];

/** Mensagem completa da proposta: resumo, itens marcáveis, prévia das regras e botões. */
export function buildProposalMessage(p: ServerProposal): { content: null; embeds: EmbedBuilder[]; components: ProposalComponents } {
  const enabledCount = p.items.filter((i) => i.enabled).length;

  const embed = new EmbedBuilder()
    .setColor(colors.primary)
    .setTitle('🧭 Proposta para o seu servidor')
    .setDescription(
      `Analisei **${p.observation.guildName}** e montei um plano. **Nada foi alterado ainda.**\n` +
        `Use o menu para marcar/desmarcar o que posso fazer e toque em **Aplicar**.\n\n` +
        `**O que vi**\n${p.facts.map((f) => `• ${f}`).join('\n')}\n` +
        (p.observation.theme !== 'default' ? `• Tema provável: ${p.observation.theme} (${p.observation.confidence}%)\n` : '')
    );

  for (const group of GROUP_ORDER) {
    const items = p.items.filter((i) => i.group === group);
    if (items.length === 0) continue;
    const lines = items.map((i) => `${i.enabled ? '✅' : '⬜'} ${i.label}${i.detail ? `\n　*${truncate(i.detail, 110)}*` : ''}`);
    embed.addFields({ name: GROUP_TITLE[group], value: truncate(lines.join('\n'), 1024) });
  }

  embed.addFields({
    name: `📜 Prévia das regras (${SOURCE_LABEL[p.rulesSource]})`,
    value: truncate(p.rulesText, 900) || '—',
  });
  embed.setFooter({ text: `Proposta ${p.id} • ${enabledCount} item(ns) marcado(s) • expira em 24h • dá para desfazer depois` });

  const options = p.items.slice(0, 25).map((i) =>
    new StringSelectMenuOptionBuilder()
      .setLabel(truncate(`${GROUP_EMOJI[i.group]} ${i.label}`, 100))
      .setValue(i.id)
      .setDescription(truncate(i.detail || i.label, 100))
      .setDefault(i.enabled)
  );

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`prop_sel_${p.id}`)
    .setPlaceholder('O que o Patito pode fazer?')
    .setMinValues(0)
    .setMaxValues(options.length)
    .addOptions(options);

  const buttons = [
    new ButtonBuilder().setCustomId(`prop_apply_${p.id}`).setLabel('Aplicar').setEmoji('✅').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`prop_rules_${p.id}`).setLabel('Editar regras').setEmoji('✏️').setStyle(ButtonStyle.Primary),
  ];
  if (aiService.isAvailable()) {
    buttons.push(new ButtonBuilder().setCustomId(`prop_regen_${p.id}`).setLabel('Regerar regras').setEmoji('🔄').setStyle(ButtonStyle.Secondary));
  }
  buttons.push(new ButtonBuilder().setCustomId(`prop_cancel_${p.id}`).setLabel('Cancelar').setEmoji('❌').setStyle(ButtonStyle.Danger));

  return {
    content: null,
    embeds: [embed],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)],
  };
}

export function buildResultEmbed(result: ApplyResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor(result.failures.length > 0 ? colors.warning : colors.success)
    .setTitle(result.failures.length > 0 ? 'Aplicado, com alguns avisos' : 'Servidor atualizado!');

  if (result.done.length) embed.addFields({ name: '✅ Feito', value: truncate(result.done.map((l) => `• ${l}`).join('\n'), 1024) });
  if (result.skipped.length) embed.addFields({ name: '⏭️ Pulado', value: truncate(result.skipped.map((l) => `• ${l}`).join('\n'), 1024) });
  if (result.failures.length) embed.addFields({ name: '⚠️ Falhas', value: truncate(result.failures.map((l) => `• ${l}`).join('\n'), 1024) });
  if (!result.done.length && !result.skipped.length && !result.failures.length) embed.setDescription('Nenhum item estava marcado — nada foi alterado.');

  embed.addFields({ name: '↩️ Para desfazer', value: `\`/autoconfig desfazer id:${result.undoId}\`` });
  return embed;
}
