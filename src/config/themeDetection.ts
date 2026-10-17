/**
 * Palavras-chave associadas a cada tema, usadas para detectar automaticamente
 * o tipo de servidor a partir dos nomes de canais e cargos já existentes.
 * Quanto mais ocorrências de um tema, maior a confiança na detecção.
 */
export const themeKeywords: Record<string, string[]> = {
  rima: ['rima', 'freestyle', 'free style', 'mc', 'batalha', 'battle', 'rap', 'hiphop', 'hip hop', 'cypher', 'flow', 'beat', 'verso'],
  futebol: ['futebol', 'flamengo', 'palmeiras', 'corinthians', 'gol', 'time', 'campeonato', 'torcida', 'futsal'],
  jogos: ['jogo', 'game', 'gamer', 'lol', 'valorant', 'fortnite', 'minecraft', 'csgo', 'cs2', 'free fire'],
  musica: ['música', 'musica', 'playlist', 'dj', 'artista', 'álbum', 'produtor musical'],
  estudos: ['estudo', 'escola', 'faculdade', 'vestibular', 'enem', 'prova', 'aula', 'monitoria'],
  empresa: ['empresa', 'trabalho', 'equipe', 'cliente', 'suporte técnico', 'vendas', 'projeto'],
  comunidade: ['comunidade', 'amigos', 'geral', 'social'],
};

export function detectThemeFromText(combinedText: string): { theme: string; confidence: number } {
  const lower = combinedText.toLowerCase();
  let bestTheme = 'default';
  let bestScore = 0;
  const scores: Record<string, number> = {};

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      // Conta cada ocorrência, não só presença, para refletir o quão temático o servidor é.
      const matches = lower.split(keyword).length - 1;
      score += matches;
    }
    scores[theme] = score;
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme;
    }
  }

  // Confiança simples: 0 ocorrências = 0%, 1-2 = ~40%, 3-5 = ~70%, 6+ = ~95%.
  const confidence = bestScore === 0 ? 0 : bestScore <= 2 ? 40 : bestScore <= 5 ? 70 : 95;

  return { theme: bestScore === 0 ? 'default' : bestTheme, confidence };
}
