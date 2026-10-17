ESTRUTURA DO BOT PATITO

src/
├── index.ts
├── config.ts
├── types/
│   ├── command.ts
│   ├── button.ts
│   ├── modal.ts
│   ├── selectMenu.ts
│   ├── ticket.ts
│   ├── warning.ts
│   ├── case.ts
│   ├── giveaway.ts
│   ├── reminder.ts
│   └── serverSettings.ts
├── commands/ (289 comandos em 16 categorias)
├── events/ (29 arquivos)
├── handlers/ (8 arquivos)
├── services/ (21 arquivos)
├── interactions/
│   ├── buttons/ (5 arquivos)
│   ├── modals/ (4 arquivos)
│   └── selectMenus/ (5 arquivos)
├── database/
│   ├── database.ts
│   ├── jsonDatabase.ts
│   ├── dataValidator.ts
│   ├── migration.ts
│   ├── backup.ts
│   └── repositories/ (9 arquivos)
├── utils/ (16 arquivos)
├── config/ (9 arquivos)
├── jobs/ (6 arquivos)
└── middlewares/ (6 arquivos)

data/
├── warnings.json
├── mutes.json
├── bans.json
├── kicks.json
├── cases.json
├── tickets.json
├── settings.json
├── autoroles.json
├── automod.json
├── giveaways.json
└── reminders.json

logs/
├── moderation.log
├── messages.log
├── members.log
├── voice.log
└── errors.log

backups/
└── (arquivos de backup)

Root:
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── config.example.env
└── deploy-commands.ts

AUTO-CONFIGURAÇÃO POR PROPOSTA (nada muda sem aprovação do dono)

Fluxo: escanear → proposta editável → dono aprova → aplicar → (opcional) desfazer.

src/
├── commands/owner/autoconfig.ts            /autoconfig analisar | desfazer [id]
├── services/
│   ├── autoConfigService.ts                ao entrar/iniciar: monta a proposta e envia por DM ao dono (fallback: canal do servidor)
│   ├── serverProposalService.ts            build() lê o servidor e propõe; apply() executa só o marcado; undo() desfaz
│   ├── serverRulesService.ts               regras geradas a partir do que foi visto (IA se houver XAI_API_KEY; senão modelo)
│   └── serverProposalView.ts               mensagem da proposta (embed + menu de itens + botões)
└── interactions/
    ├── buttons/proposalButtons.ts          Aplicar, Editar regras, Regerar regras, Cancelar
    ├── selectMenus/proposalSelectMenu.ts   marcar/desmarcar itens
    └── modals/proposalRulesModal.ts        edição do texto das regras

data/
├── server_proposals.json                   propostas (válidas por 24h)
└── server_proposal_undo.json               registros para /autoconfig desfazer

Regras de segurança:
- Só o OWNER_ID aprova/edita.
- Nunca renomeia, move ou apaga o que já existia. Itens que mexem no existente (ex.: permissões do @everyone) vêm desmarcados.
- Configuração que já tem valor só é trocada se o dono marcar o item.
- Depois de editar o código de comandos, rode: npm run deploy (registra o /autoconfig).
