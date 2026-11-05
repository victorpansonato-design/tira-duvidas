# Tira-dúvidas

Protótipo responsivo da UniAnchieta em React, TypeScript e Vite. Voz como modo inicial, alternância para texto no compositor, caderno de estudo, histórico local e tela de atendimento.

## Desenvolvimento

Use Node.js 24.

```sh
npm --prefix anchy-clone ci
npm --prefix anchy-clone run dev
```

## Verificação

```sh
npm --prefix anchy-clone test
npm --prefix anchy-clone run build
```

## Vercel

- Repositório: `victorpansonato-design/tira-duvidas`
- Root Directory: `anchy-clone`
- Framework: Vite
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Production Branch: `main`

A rota `/original` mantém a reprodução anterior para comparação. A entrada principal usa o design atual. Os parâmetros `?origem=ava` e `?origem=app` demonstram entrada com e sem matéria fornecida pelo contexto.

Não são necessárias variáveis de ambiente para este protótipo. As respostas e o fluxo de voz são demonstrações locais: não há IA, captura de áudio ou conexão com a fila real de atendimento. Histórico e rascunhos ficam neste navegador, sem sincronização de conta.

[Documentação da aplicação](anchy-clone/README.md), [pesquisa](anchy-clone/docs/PESQUISA.md) e [verificações](anchy-clone/docs/VERIFICACAO.md).

Capturas e dados de inspeção do navegador ficam fora do versionamento. Os arquivos de marca e mídia usados no protótipo permanecem em `anchy-clone/public/assets`; o crédito da mídia testada está na pesquisa.
