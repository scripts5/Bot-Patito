import { aiService } from './aiService.js';
import { DetectedBot } from '../types/serverSettings.js';
import { logger } from '../utils/logger.js';
import { truncate } from '../utils/stringUtils.js';

export interface ChannelRef {
  id: string;
  name: string;
}

/**
 * Resumo do que o Patito "viu" no servidor. É a base tanto das regras geradas quanto
 * da proposta mostrada ao dono. Guardado dentro da proposta para permitir regerar as regras.
 */
export interface ProposalObservation {
  guildName: string;
  theme: string;
  confidence: number;
  textChannelCount: number;
  voiceChannelCount: number;
  categoryCount: number;
  roleCount: number;
  rulesChannel: ChannelRef | null;
  botChannel: ChannelRef | null;
  adsChannel: ChannelRef | null;
  supportChannel: ChannelRef | null;
  hasTicketCategory: boolean;
  bots: DetectedBot[];
}

export type RulesSource = 'ia' | 'modelo' | 'editado';

// Limite de uma mensagem do Discord é 2000; deixamos folga.
export const MAX_RULES_LENGTH = 1900;

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const THEME_INTRO: Record<string, string> = {
  rima: 'Aqui é lugar de rima, freestyle e batalha.',
  futebol: 'Aqui é lugar de torcedor: futebol, resenha e boa convivência.',
  jogos: 'Aqui é a comunidade de quem gosta de jogar.',
  musica: 'Aqui é lugar de música e de quem vive ela.',
  estudos: 'Aqui é um espaço para estudar e aprender juntos.',
  empresa: 'Aqui é o espaço de trabalho e organização da equipe.',
  comunidade: 'Aqui é um espaço de convivência entre amigos.',
};

const THEME_RULE: Record<string, string> = {
  rima: 'Na batalha vale rimar pesado, mas ataque pessoal, preconceito e ameaça são proibidos.',
  futebol: 'Rivalidade é bem-vinda; ofensa, racismo e provocação pessoal não são.',
  jogos: 'Proibido divulgar cheats, hacks ou contas. Use spoiler em conteúdo que entrega a história.',
  musica: 'Respeite direitos autorais e divulgue música só nos canais próprios.',
  estudos: 'Não peça nem venda trabalhos prontos: ajude explicando, não só dando a resposta.',
  empresa: 'Informações de clientes e de projetos ficam restritas aos canais da equipe.',
};

/**
 * Regras montadas a partir do que foi observado (canais de voz, canal de bots, de divulgação,
 * de suporte, tema). Sempre funciona, mesmo sem IA.
 */
export function buildRulesFromTemplate(obs: ProposalObservation): string {
  const hasTheme = obs.theme !== 'default' && obs.confidence > 0;
  const intro = (hasTheme && THEME_INTRO[obs.theme]) || 'Aqui é um espaço de convivência.';

  const rules: string[] = [];
  rules.push('Respeite todos os membros. Não toleramos preconceito, assédio, ameaças ou bullying.');
  rules.push('Nada de spam, flood ou menção em massa sem motivo.');
  if (hasTheme && THEME_RULE[obs.theme]) rules.push(THEME_RULE[obs.theme]);
  rules.push('Conteúdo NSFW, ilegal ou que incentive violência é proibido.');
  rules.push(
    obs.botChannel
      ? `Comandos de bots só em <#${obs.botChannel.id}>. Nos outros canais, mantenha o assunto do canal.`
      : 'Use cada canal para o que ele foi feito.'
  );
  rules.push(
    obs.adsChannel
      ? `Divulgação e propaganda somente em <#${obs.adsChannel.id}>.`
      : 'Divulgação e propaganda só com autorização da staff.'
  );
  if (obs.voiceChannelCount > 0) {
    rules.push('Nos canais de voz: sem gritar, sem som alto no microfone e sem atrapalhar quem está falando.');
  }
  rules.push('Convites de outros servidores só com autorização da staff.');
  rules.push(
    obs.supportChannel
      ? `Siga as orientações da staff. Precisa de ajuda ou quer contestar algo? Fale em <#${obs.supportChannel.id}>.`
      : 'Siga as orientações da staff. Dúvida ou contestação? Fale com a staff em privado.'
  );

  const numbered = rules.slice(0, NUMBER_EMOJIS.length).map((text, i) => `${NUMBER_EMOJIS[i]} ${text}`);

  const text = [
    `📜 **REGRAS — ${obs.guildName}**`,
    '',
    intro,
    '',
    ...numbered,
    '',
    '🚨 O descumprimento pode resultar em aviso, timeout, kick ou ban, conforme a gravidade.',
    '',
    'Divirta-se! 🎉',
  ].join('\n');

  return truncate(text, MAX_RULES_LENGTH);
}

function allowedMentionIds(obs: ProposalObservation): Set<string> {
  return new Set([obs.rulesChannel, obs.botChannel, obs.adsChannel, obs.supportChannel].filter((c): c is ChannelRef => c !== null).map((c) => c.id));
}

async function askAi(obs: ProposalObservation): Promise<string | null> {
  const refs = [
    obs.rulesChannel && `canal de regras: <#${obs.rulesChannel.id}>`,
    obs.botChannel && `canal de comandos de bots: <#${obs.botChannel.id}>`,
    obs.adsChannel && `canal de divulgação: <#${obs.adsChannel.id}>`,
    obs.supportChannel && `canal de suporte: <#${obs.supportChannel.id}>`,
  ].filter(Boolean);

  const prompt = [
    `Servidor: ${obs.guildName}`,
    `Tema detectado: ${obs.theme} (${obs.confidence}% de confiança)`,
    `Canais de texto: ${obs.textChannelCount}. Canais de voz: ${obs.voiceChannelCount}. Cargos: ${obs.roleCount}.`,
    `Outros bots: ${obs.bots.length ? obs.bots.map((b) => b.name).join(', ') : 'nenhum'}.`,
    refs.length ? `Menções de canal que você PODE usar (copie exatamente): ${refs.join('; ')}.` : 'Não use menções de canal.',
    '',
    'Escreva as regras deste servidor em português do Brasil: de 6 a 9 regras numeradas com emoji, tom claro e amigável, no máximo 1500 caracteres.',
    'Use só as menções de canal fornecidas. Não invente canais, cargos ou punições além de aviso, timeout, kick e ban.',
    'Responda SOMENTE com o texto das regras.',
  ].join('\n');

  const key = 'proposal-rules';
  try {
    const reply = await aiService.ask(key, prompt, 'Você redige regras de servidores de Discord. Seja objetivo e não invente informações.');
    let text = reply.trim().replace(/@everyone/g, 'todos').replace(/@here/g, 'todos');

    if (text.length < 150 || text.length > MAX_RULES_LENGTH) return null;

    const allowed = allowedMentionIds(obs);
    for (const m of text.matchAll(/<#(\d+)>/g)) {
      if (!allowed.has(m[1])) return null; // a IA citou um canal que não foi fornecido
    }
    if (/<@[&!]?\d+>/.test(text)) return null; // sem menção a usuário/cargo
    return text;
  } finally {
    aiService.clearConversation(key);
  }
}

/** Gera as regras: tenta a IA (se houver chave) e cai no modelo se falhar ou vier fora do padrão. */
export async function generateRules(obs: ProposalObservation): Promise<{ text: string; source: RulesSource }> {
  if (aiService.isAvailable()) {
    try {
      const text = await askAi(obs);
      if (text) return { text, source: 'ia' };
      logger.warn('serverRulesService', 'A IA devolveu regras fora do padrão; usando o modelo.');
    } catch (err) {
      logger.warn('serverRulesService', `IA indisponível para gerar regras, usando o modelo: ${err}`);
    }
  }
  return { text: buildRulesFromTemplate(obs), source: 'modelo' };
}
