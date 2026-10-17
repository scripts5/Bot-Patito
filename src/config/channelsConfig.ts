import { ChannelType } from 'discord.js';

export interface ChannelBlueprint {
  name: string;
  type: ChannelType.GuildText | ChannelType.GuildVoice;
  topic?: string;
  staffOnly?: boolean;
}

export interface CategoryBlueprint {
  name: string;
  staffOnly?: boolean;
  channels: ChannelBlueprint[];
}

/**
 * Estrutura de categorias/canais por tema. Toda estrutura sempre inclui:
 * - Categoria geral (regras, bem-vindo, anúncios, chat)
 * - Categoria temática
 * - Categoria de voz
 * - Categoria de STAFF (privada — visível só para cargos de staff)
 */
const staffCategory: CategoryBlueprint = {
  name: '🔒 STAFF',
  staffOnly: true,
  channels: [
    { name: 'staff-chat', type: ChannelType.GuildText, topic: 'Conversa interna da equipe', staffOnly: true },
    { name: 'reuniões', type: ChannelType.GuildText, topic: 'Organização de reuniões da staff', staffOnly: true },
    { name: 'registro-de-ações', type: ChannelType.GuildText, topic: 'Log interno de decisões da staff', staffOnly: true },
    { name: 'Sala da Staff', type: ChannelType.GuildVoice, staffOnly: true },
  ],
};

const generalCategory: CategoryBlueprint = {
  name: '📢 GERAL',
  channels: [
    { name: 'regras', type: ChannelType.GuildText, topic: 'Regras do servidor' },
    { name: 'bem-vindo', type: ChannelType.GuildText, topic: 'Boas-vindas aos novos membros' },
    { name: 'anúncios', type: ChannelType.GuildText, topic: 'Anúncios oficiais' },
    { name: 'chat-geral', type: ChannelType.GuildText, topic: 'Conversa geral' },
  ],
};

const voiceCategoryDefault: CategoryBlueprint = {
  name: '🔊 VOZ',
  channels: [
    { name: 'Geral', type: ChannelType.GuildVoice },
    { name: 'Sala 2', type: ChannelType.GuildVoice },
  ],
};

export const channelThemes: Record<string, CategoryBlueprint[]> = {
  futebol: [
    generalCategory,
    {
      name: '⚽ FUTEBOL',
      channels: [
        { name: 'jogos-hoje', type: ChannelType.GuildText, topic: 'Jogos do dia' },
        { name: 'resultados', type: ChannelType.GuildText, topic: 'Resultados das partidas' },
        { name: 'discussão-tática', type: ChannelType.GuildText, topic: 'Debate sobre táticas e escalações' },
        { name: 'memes-futebol', type: ChannelType.GuildText, topic: 'Memes e zoeira' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Torcida', type: ChannelType.GuildVoice }, { name: 'Bate-papo', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  jogos: [
    generalCategory,
    {
      name: '🎮 GAMES',
      channels: [
        { name: 'procurando-grupo', type: ChannelType.GuildText, topic: 'Encontre pessoas pra jogar junto' },
        { name: 'clips', type: ChannelType.GuildText, topic: 'Compartilhe seus melhores momentos' },
        { name: 'dicas-e-guias', type: ChannelType.GuildText, topic: 'Dicas e guias de jogos' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Sala 1', type: ChannelType.GuildVoice }, { name: 'Sala 2', type: ChannelType.GuildVoice }, { name: 'Sala 3', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  musica: [
    generalCategory,
    {
      name: '🎵 MÚSICA',
      channels: [
        { name: 'divulgação', type: ChannelType.GuildText, topic: 'Divulgue suas músicas/playlists' },
        { name: 'recomendações', type: ChannelType.GuildText, topic: 'Recomende músicas e artistas' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Sala de Escuta', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  estudos: [
    generalCategory,
    {
      name: '📚 ESTUDOS',
      channels: [
        { name: 'dúvidas', type: ChannelType.GuildText, topic: 'Tire suas dúvidas aqui' },
        { name: 'materiais', type: ChannelType.GuildText, topic: 'Materiais de estudo compartilhados' },
        { name: 'grupos-de-estudo', type: ChannelType.GuildText, topic: 'Organize grupos de estudo' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Sala de Estudos', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  rima: [
    generalCategory,
    {
      name: '🎤 BATALHAS',
      channels: [
        { name: 'envie-sua-rima', type: ChannelType.GuildText, topic: 'Mande seu freestyle em texto ou áudio' },
        { name: 'batalhas-ao-vivo', type: ChannelType.GuildText, topic: 'Acompanhe as batalhas em andamento' },
        { name: 'resultados', type: ChannelType.GuildText, topic: 'Resultados das batalhas' },
        { name: 'treino-livre', type: ChannelType.GuildText, topic: 'Treine suas rimas e peça feedback' },
        { name: 'beats-e-instrumentais', type: ChannelType.GuildText, topic: 'Compartilhe e peça beats' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Arena de Batalha', type: ChannelType.GuildVoice }, { name: 'Cypher', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  empresa: [
    generalCategory,
    {
      name: '💼 TRABALHO',
      channels: [
        { name: 'tarefas', type: ChannelType.GuildText, topic: 'Acompanhamento de tarefas' },
        { name: 'suporte', type: ChannelType.GuildText, topic: 'Suporte ao cliente' },
      ],
    },
    { name: '🔊 VOZ', channels: [{ name: 'Sala de Reunião', type: ChannelType.GuildVoice }] },
    staffCategory,
  ],
  default: [generalCategory, voiceCategoryDefault, staffCategory],
};

export function getChannelThemeFor(description: string): CategoryBlueprint[] {
  const lower = description.toLowerCase();
  for (const [keyword, structure] of Object.entries(channelThemes)) {
    if (keyword !== 'default' && lower.includes(keyword)) return structure;
  }
  return channelThemes.default;
}
