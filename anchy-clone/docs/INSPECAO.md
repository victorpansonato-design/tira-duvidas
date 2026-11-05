# Registro de inspeção — 4 de novembro de 2026

## Referência e limites da sessão

A referência principal foi `https://app.anchieta.br/anchy/`, aberta a partir do AVA pelo usuário em uma sessão de navegador dedicada. A sessão original foi mantida separada do servidor local. A ferramenta leu DOM, estilos calculados, folhas CSS, imagens e estruturas de componentes. Não foram exportados cookies, tokens, senhas ou armazenamento de autenticação.

O usuário restringiu mensagens ao chat sobre o conteúdo da disciplina. Foi usada uma pergunta fictícia sobre comunicação assertiva. Nenhuma mensagem foi enviada ao atendimento institucional. O quiz observado é uma ferramenta de estudo, sem envio de avaliação do AVA.

## Inventário observado

| Área | Estados e comportamento |
| --- | --- |
| Início | Duas opções, coruja em círculo, identificação UniAnchieta, tema e rodapé desktop. Mobile omite o rodapé. |
| Entrada acadêmica | Carregamento de contexto, identificação Comunicação e Assertividade e quatro materiais. Foi observada também a apresentação de permissão de microfone, sem coleta de credenciais ou áudio. |
| Voz | Apresentação da Anchy, microfone circular e instrução Toque para falar. Desktop usa avatar e texto lado a lado; mobile empilha o conteúdo. |
| Texto | Estado vazio central, compositor, mensagem do usuário, resposta, horários, copiar e avaliação. Limpar apaga imediatamente e mostra Desfazer. |
| Caderno | Mapa mental, Quiz, Flashcards e títulos das quatro fontes. No desktop ocupa 420 px. No mobile há uma gaveta de 92 px fechada e 85dvh aberta, com fundo escurecido. |
| Quiz | Configuração 5/10/20, Fácil/Médio/Difícil, perguntas A–E, correção certa/errada e texto explicativo. Última questão oferece Ver resultado; o feedback tem carregamento e tela final com coruja e recomendações. |
| Flashcards | Cartão vira em torno do eixo vertical. Entendi mantém o cartão e mostra Conceito dominado/Ótimo, este ficou fixado. Não entendi mostra Quase lá e orientação de revisão. Próximo/Anterior são controles separados. |
| Mapa mental | Base de conhecimento com fontes, Criando conexões, visualizador com nove ramos, expansão, detalhe, zoom, centralizar, exportação e tela cheia. Os dados do clone são mínimos e determinísticos. |
| Conversa das ferramentas | Botão Anchy abre painel de conversa com cabeçalho e Voltar ao Caderno. No desktop substitui a coluna do caderno, preservando a largura do conteúdo principal; mobile usa painel inferior. |
| Institucional | Apresentação Chat Anchieta, sugestões de horário/calendário/secretaria, histórico, anexo, voz e campo Mensagem. Só a entrada foi observada; fluxos de atendimento não foram acionados. |
| Temas | Claro e escuro com troca de mascote, tokens de cor e transição circular. |

## Medidas e recursos

- Fonte Inter, com pesos 300 a 700; arquivos obtidos como recursos públicos e salvos localmente.
- Breakpoint desktop 64rem (1024 px).
- Página desktop: 40 px nas laterais, 28 px no topo, 32 px embaixo; separação de colunas 24 px.
- Painéis 24 px de raio; cartões 20 px; pílulas circulares.
- Início com largura máxima 560 px; institucional com largura máxima 960 px; conversa central com máximo 720 px.
- Tempos recorrentes: 120/200/300 ms e curva `cubic-bezier(.33,1,.68,1)`; seletores usam mola. A transição de tema usa os estilos de view transitions do original.
- Logos e mascotes foram reutilizados como recursos públicos, com caminhos locais. Ícones da tela inicial usam os paths SVG observados.

## Comparação e limitações

Foram comparados estados desktop e mobile nas mesmas dimensões da sessão observada. A comparação de voz a 1902 × 912 apresentou diferença média por canal de aproximadamente 0,003 em uma escala 0–255; a 441 × 839, aproximadamente 0,030. Esses números descrevem somente essas capturas estáticas, não são uma garantia sobre todas as telas, plataformas e animações.

As simulações, o conjunto mínimo de perguntas/cartões e os limites de voz, histórico e anexos estão explicitados no README. Erros de backend não foram provocados. Não foi confirmado um defeito de produto para corrigir ou redesenhar nesta rodada.
