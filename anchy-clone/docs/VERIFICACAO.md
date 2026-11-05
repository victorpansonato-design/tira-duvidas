# Verificação — 5 de novembro de 2026

- TypeScript e build de produção passaram.
- 18 casos de intenção e cinco verificações de isolamento passaram (`../tools/td-routing.test.mjs`).
- 20 verificações do percurso mobile passaram: exemplos editáveis, estudo, encaminhamento, edição, desfazer, ambiguidade, dois destinos, diálogos, quiz, tema e recursos locais.
- Entrada sem matéria pediu contexto apenas após pergunta de estudo e preservou a pergunta ao selecionar a matéria.
- Desktop confirmou as cores originais, caderno de 420 px, nome da disciplina em `span`, revelação circular do tema, preparação em duas etapas e resposta progressiva.
- Reprodução automática confirmada: vídeo 3840 × 2160, mudo, em loop, sem controles sobrepostos. Preferência de movimento interrompe a mídia.
- Mobile não montou vídeo nem baixou vídeo/poster. Nenhuma requisição externa nos fluxos locais testados.
- Axe 4.12.1: zero violações e zero verificações incompletas nas telas auditadas; 42 verificações aprovadas no desktop, 39 no mobile.
- Capturas em 1902 × 912, 390 × 844 e 320 × 700; altura de 390 × 460 usada para conferir restrição de espaço semelhante à abertura de teclado. Isso é emulação, não teste de teclado iOS/Android real.
- Nenhum erro de execução registrado na conferência final do navegador.
- Detector mecânico apontou somente a fonte Inter como frequente em outros projetos. Foi mantida por ser a fonte existente e por instrução de preservar a identidade.

Os relatórios e capturas estão em `../reference/td-*`. A auditoria automática não atesta conformidade integral com WCAG, uso com leitor de tela ou usabilidade validada com alunos. As respostas e integrações continuam demonstrativas e locais.


## Histórico, atendimento e refino posterior

O vídeo foi retirado da interface. A coluna final tem máximo de 880 px; título, sugestões e compositor têm as mesmas bordas, medidas no navegador. Logo superior de 28 px. Nome da disciplina com negrito reforçado e cor principal.

Passaram 12 verificações de armazenamento local e os 18 casos de intenção com cinco verificações de isolamento. O navegador confirmou busca, indicação da conversa atual, sobreposição nas bordas do caderno, fechamento animado e 11 verificações de ida e volta entre estudo e o Chat Anchieta reproduzido. Recarregar restaurou as duas mensagens do atendimento. A pergunta fica preenchida sem envio automático. Nenhuma conexão com suporte real.

Histórico: auditoria automática sem violações ou itens incompletos. Tela inicial e atendimento: sem violações reportadas, com contraste marcado para revisão manual por causa do degradê em pseudo-elemento e da estrutura em Shadow DOM. Não se deve interpretar isso como aprovação automática integral. Os textos principais preservam branco e cinza claro sobre superfícies escuras; o brilho não cobre os campos opacos.

A fonte Inter foi preservada apesar do aviso genérico do detector, conforme a identidade solicitada. As capturas mais recentes são `td-balanced-*`, e os relatórios funcionais são `td-history-stage1.json` e `td-history-stage2.json`.

## Modo de voz como entrada

Passaram 22 verificações no navegador: voz inicial, seletor no compositor, atalho de teclado, ausência de ativação automática, conservação do rascunho, explicação e cancelamento da demonstração, ausência de envio tardio, resposta compartilhada, histórico com modo/rascunho, nova conversa em voz e nenhuma chamada externa de áudio. Capturas em 1440 × 900, 390 × 844 e 320 × 700. O fluxo continua local e não captura ou reproduz áudio.
