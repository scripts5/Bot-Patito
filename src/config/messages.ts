export const messages = {
  noPermission: 'Você não tem permissão para usar esse comando.',
  botNoPermission: 'Não tenho permissão suficiente para executar essa ação.',
  guildOnly: 'Esse comando só pode ser usado dentro de um servidor.',
  ownerOnly: 'Esse comando é exclusivo do dono do bot.',
  cooldown: (seconds: string) => `Aguarde ${seconds}s antes de usar esse comando novamente.`,
  genericError: 'Ocorreu um erro inesperado. Já foi registrado nos logs.',
  memberNotFound: 'Membro não encontrado no servidor.',
  invalidTarget: 'Alvo inválido para essa ação.',
  actionSuccess: 'Ação concluída com sucesso.',
} as const;
