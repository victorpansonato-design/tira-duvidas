# Tira-dúvidas
<!-- impeccable:product-schema 1 -->

## Platform
Web responsiva, acessada pelo AVA e pelo aplicativo da instituição. Segundo o responsável pelo produto, aproximadamente 80% do acesso acontece por celular; esse percentual é uma informação do briefing, não uma medição desta entrega.

## Usuários e tarefa
Alunos que precisam entender o conteúdo de uma disciplina ou resolver uma dúvida sobre serviços da faculdade. A entrada deve permitir escrever imediatamente, sem exigir que o aluno entenda a distinção administrativa entre “acadêmico” e “institucional”. Nome solicitado: Tira-dúvidas.

## Restrições confirmadas
As bases de disciplinas e de serviços devem permanecer separadas. Uma disciplina não pode consultar as outras. Não substituir o sistema por um assistente genérico. Preservar a identidade da UniAnchieta e as ferramentas de estudo existentes. Mobile é obrigatório; vídeo somente no desktop e sem prejudicar a tarefa principal. Nesta aplicação, dados e encaminhamentos continuam sendo demonstrações locais: não há integração com IA, AVA ou fila de suporte.

## Stack
React, TypeScript e Vite, já presentes no projeto. A estrutura anterior permanece acessível em `/original` para comparação. Contexto de disciplina demonstrativo: Comunicação e Assertividade. A URL `/?origem=app` demonstra uma entrada sem disciplina previamente selecionada.

## Decisões delegadas
O usuário solicitou pesquisa e implementação diretamente, e já pediu que confirmações de rotina fossem evitadas. O fluxo e a composição foram derivados desse briefing: chat imediato, contexto visível, exemplos opcionais, encaminhamento explicado e clarificação de perguntas ambíguas. Não houve afirmação de que este protótipo foi validado em estudo com alunos.
