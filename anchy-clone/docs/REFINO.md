# Direção de refino — 5 de novembro de 2026

Correções solicitadas pelo usuário após a primeira proposta. A referência principal volta a ser o próprio sistema, já inspecionado e reproduzido em `/original`.

| Antes | Depois | Motivo |
| --- | --- | --- |
| Escuro azulado e início claro | Escuro original: fundo `#0c0c0c`, painel `#202020`, texto branco e link `#6dbce6` | Preservar a identidade existente |
| Troca instantânea de tema | Mesmo View Transition circular e CSS do original, 760 ms | Reutilizar o comportamento existente |
| Caderno estreito sem painel | Caderno original em painel de 420 px; gaveta no celular | Recuperar hierarquia, descrições e fontes |
| Vídeo pequeno no caderno | Faixa horizontal no acolhimento do chat, sem controle sobreposto | Usar a largura sem competir com as ferramentas |
| Seletor de disciplina sempre disponível | Nome estático, sem seta nem ação | O AVA já determina a matéria |
| Resposta inteira em 850 ms | Feedback imediato, preparação em duas etapas e texto progressivo | Dar continuidade perceptível à conversa |
| Montagem e remoção instantâneas | Entradas e saídas curtas, sem deslocamentos grandes ou elasticidade | Evitar saltos e manter a orientação |

O chat continua sendo a entrada única. A separação operacional das bases e históricos permanece obrigatória. A escolha de matéria só é necessária quando a origem não fornece contexto e a pergunta depende de conteúdo didático.

Animações não provam usabilidade. A avaliação abaixo verifica implementação e continuidade visual; aprovação com alunos em tarefas reais continua sendo a validação de produto que falta. Não se simula pesquisa em documentos nem se exibe raciocínio oculto: os estados da demonstração descrevem preparação de uma resposta local.

O vídeo é decorativo, mudo e exclusivo do desktop. Economia de dados e preferência por movimento reduzido usam imagem estática. A preferência de movimento da interface permite desativá-lo sem um botão sobreposto ao vídeo.

As escolhas de movimento respeitam a preferência do sistema, conforme [web.dev — acessibilidade e movimento](https://web.dev/learn/design/accessibility). O controle de movimento também atende à necessidade de interromper conteúdo decorativo contínuo descrita no [W3C — Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
