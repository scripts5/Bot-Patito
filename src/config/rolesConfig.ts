/**
 * Cargos criados automaticamente pelo /criar.
 * Todo servidor recebe os cargos de staff (sempre) + os cargos temáticos do tema detectado.
 * O total é sempre >= 10 cargos.
 */
export interface RoleBlueprint {
  name: string;
  color: number;
  hoist: boolean; // aparece separado na lista de membros
  mentionable: boolean;
  isStaff: boolean;
}

// Cargos de staff: sempre criados, em toda estrutura, em qualquer tema.
export const staffRoles: RoleBlueprint[] = [
  { name: '👑 Dono', color: 0xf1c40f, hoist: true, mentionable: false, isStaff: true },
  { name: '🛡️ Administrador', color: 0xe74c3c, hoist: true, mentionable: true, isStaff: true },
  { name: '🔨 Moderador', color: 0x3498db, hoist: true, mentionable: true, isStaff: true },
  { name: '👮 Staff', color: 0x1abc9c, hoist: true, mentionable: true, isStaff: true },
];

// Cargos temáticos (mínimo 6 por tema, somados aos 4 de staff = 10+).
export const roleThemes: Record<string, RoleBlueprint[]> = {
  futebol: [
    { name: '⚽ Torcedor', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🏆 Craque', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '📋 Técnico', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '🎙️ Narrador', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
    { name: '🔥 Fanático', color: 0xe74c3c, hoist: false, mentionable: false, isStaff: false },
    { name: '🥅 Goleiro', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
    { name: '📺 Streamer', color: 0x8e44ad, hoist: false, mentionable: false, isStaff: false },
  ],
  jogos: [
    { name: '🎮 Gamer', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🏆 Pro Player', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '🎯 Iniciante', color: 0x95a5a6, hoist: false, mentionable: false, isStaff: false },
    { name: '👑 Lenda', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '📺 Streamer', color: 0x8e44ad, hoist: false, mentionable: false, isStaff: false },
    { name: '🎨 Criador de Conteúdo', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
    { name: '🤝 Parceiro', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
  ],
  musica: [
    { name: '🎵 Ouvinte', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🎤 Artista', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '🎧 DJ', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '🎸 Produtor', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
    { name: '⭐ Fã Master', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '🎹 Compositor', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
    { name: '📀 Colecionador', color: 0x8e44ad, hoist: false, mentionable: false, isStaff: false },
  ],
  estudos: [
    { name: '📚 Estudante', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🎓 Monitor', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '🧑‍🏫 Professor', color: 0x3498db, hoist: false, mentionable: false, isStaff: false },
    { name: '✏️ Calouro', color: 0x95a5a6, hoist: false, mentionable: false, isStaff: false },
    { name: '🏅 Veterano', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '🔬 Pesquisador', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '📖 Leitor Voraz', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
  ],
  comunidade: [
    { name: '👤 Membro', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🌟 Membro Ativo', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '🎉 Veterano', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '🤝 Parceiro', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
    { name: '🎨 Criativo', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '📢 Divulgador', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
  ],
  rima: [
    { name: '🎤 MC', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🏆 Campeão de Batalha', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '🔥 Freestyler', color: 0xe74c3c, hoist: false, mentionable: false, isStaff: false },
    { name: '🎧 Beatmaker', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '⚖️ Jurado', color: 0x3498db, hoist: false, mentionable: false, isStaff: false },
    { name: '📢 Hypeman', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
    { name: '🎙️ Veterano das Batalhas', color: 0x1abc9c, hoist: false, mentionable: false, isStaff: false },
  ],
  empresa: [
    { name: '👔 Colaborador', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '📊 Gerente', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '💼 Diretor', color: 0xe74c3c, hoist: false, mentionable: false, isStaff: false },
    { name: '🧑‍💻 Suporte', color: 0x3498db, hoist: false, mentionable: false, isStaff: false },
    { name: '🤝 Cliente', color: 0x95a5a6, hoist: false, mentionable: false, isStaff: false },
    { name: '📈 Analista', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
  ],
  default: [
    { name: '👤 Membro', color: 0x2ecc71, hoist: false, mentionable: false, isStaff: false },
    { name: '🌟 Ativo', color: 0xf39c12, hoist: false, mentionable: false, isStaff: false },
    { name: '🎉 Veterano', color: 0xf1c40f, hoist: false, mentionable: false, isStaff: false },
    { name: '🤝 Convidado', color: 0x95a5a6, hoist: false, mentionable: false, isStaff: false },
    { name: '🎨 Criativo', color: 0x9b59b6, hoist: false, mentionable: false, isStaff: false },
    { name: '📢 Divulgador', color: 0xe67e22, hoist: false, mentionable: false, isStaff: false },
  ],
};

export function getRoleThemeFor(description: string): RoleBlueprint[] {
  const lower = description.toLowerCase();
  for (const [keyword, roles] of Object.entries(roleThemes)) {
    if (keyword !== 'default' && lower.includes(keyword)) return roles;
  }
  return roleThemes.default;
}

/**
 * Retorna a lista final de cargos a criar: staff (4) + temáticos (6-7) = 10+ sempre.
 */
export function buildFullRoleSet(description: string): RoleBlueprint[] {
  return [...staffRoles, ...getRoleThemeFor(description)];
}
