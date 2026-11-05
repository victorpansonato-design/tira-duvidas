# Tira-dúvidas — protótipo local

React, TypeScript e Vite. Entrada direta no chat com disciplina e serviços em destinos separados. Paleta, animação de tema e caderno originais preservados. Reprodução anterior disponível em `/original`.

## Executar

```powershell
cd anchy-clone
npm install
npm run dev
```

Abra http://127.0.0.1:5173/. `npm run build` verifica TypeScript e gera produção. `node ../tools/td-routing.test.mjs` verifica intenção e isolamento de contexto.

## Comportamento

- Modo Voz como entrada inicial e em novas conversas. Seletor Voz / Texto dentro do compositor, com transição contínua e preservação do rascunho.
- Em Texto, campo imediato e exemplos editáveis, sem envio automático.
- Voz: apresentação com coruja e degradê, explicação da prévia, demonstração cancelável, preparação e resposta compartilhada com Texto. O histórico restaura o último modo.
- Disciplina estática. `/?origem=app` demonstra entrada sem matéria; ela é pedida quando a pergunta depende desse contexto.
- Ambiguidade pede esclarecimento; dois assuntos pedem separação. Atendimento exige encaminhamento explícito e preserva o texto.
- Históricos por `course:<id>` ou `institution`. Linha do tempo visual compartilhada, envelope de consulta isolado por destino.
- Preparação de resposta, degradê e texto progressivo, todos demonstrativos.
- Caderno original com mapa, quiz, flashcards e fontes. Painel desktop e gaveta mobile.
- Paleta e revelação circular de tema originais. Painéis e mensagens com transições suaves.
- Abertura sem vídeo, com brilho azul difuso estático na área de escrita. Título, sugestões e campo usam a mesma coluna, de até 880 px no desktop. A mídia testada permanece nos arquivos, sem montagem ou download na interface.
- Histórico ao lado de Nova conversa: busca por título/conteúdo, agrupamento por dia, conversa atual e retomada. Painel cobre o caderno no desktop e usa a tela no mobile.
- Ir para o atendimento abre a reprodução do Chat Anchieta original, com a pergunta no campo, sem envio automático. É possível voltar ao estudo e continuar o atendimento depois.

## Limites e integração

Não há autenticação, IA, backend, AVA ou SDK do atendimento. Nenhuma mensagem é enviada à fila real de suporte. Respostas, avaliações, ferramentas e histórico são locais. Histórico, mensagens, rascunhos, contexto, tema e preferência de movimento persistem somente neste navegador. O armazenamento é local, sem sincronização de conta. Uma resposta local de atendimento pendente é retomada ao reabrir a conversa. Voz demonstra estados visuais com uma pergunta de exemplo: não ativa o microfone, não grava, não transcreve e não reproduz áudio. A explicação aparece antes de iniciar a demonstração.

`src/routing.ts` contém regras demonstrativas, não um roteador semântico pronto para produção. O backend precisa autenticar aluno e instituição, autorizar a disciplina, limitar documentos, escolher o serviço de destino e usar somente o histórico daquele escopo. O ID enviado pelo navegador não constitui autorização. A integração exige avaliação de intenções em português e casos ambíguos.

As ferramentas anteriores têm cinco questões e cinco flashcards fixos, reutilizados nas quantidades maiores; dificuldade não gera conteúdo. O mapa demonstra a estrutura com subtópicos fictícios. As fontes são títulos; os materiais privados não estão incluídos. Não há credenciais, cookies ou tokens do original.

## Evidências

[Pesquisa e fontes](docs/PESQUISA.md), [direção corrigida](docs/REFINO.md) e [inspeção anterior](docs/INSPECAO.md). Capturas e relatórios em `../reference/td-*`.

Verificação automática é evidência técnica, não comprova usabilidade com alunos. iOS/Android, leitor de tela e rede móvel reais ainda precisam ser testados em dispositivos.
