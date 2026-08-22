# CO2·QField — Landing Page de Validação (V1, Rev 2)

Site estático, sem login, sem backend. Objetivo: testar a recepção do produto
junto às personas-alvo (analistas ambientais, gestores de planta, auditores,
investidores) antes de qualquer definição de preço ou modelo comercial.

## O que mudou na Rev 2

- **Tema claro** no lugar do grafite escuro — mais alinhado ao tom "relatório
  técnico sério" que o público-alvo (gestores, auditores) espera, e mais leve
  para leitura longa do FAQ.
- **Hero reescrito**, nomeando a dor diretamente na manchete, em vez de só
  descrever a solução em abstrato.
- **Diagrama de fluxo com ícones** (QR Code, GPS, Cálculo, Validação,
  Dashboard) no lugar da linha fina anterior — mesmos princípios de zero
  dependência externa (SVG inline, sem biblioteca de ícones).
- **Mockup ilustrativo do dashboard** (dados fictícios, deixado explícito no
  texto) para dar prova visual de que o produto existe de fato.
- **Links de referências normativas** (GHG Protocol, IPCC, MCTI) no FAQ e no
  rodapé. *Atenção: essas URLs não foram verificadas por busca ao vivo —
  confirme se ainda são os endereços oficiais corretos antes de publicar.*
- **Correção do bug do 404:** o `index.html` anterior (variante Formspree)
  referenciava `script-formspree.js`, mas o arquivo físico havia sido
  renomeado para `script.js` — nome não batia, o script nunca carregava, e
  por isso o FAQ não abria ao clicar. Root cause documentado para não se
  repetir: veja a convenção de nomes abaixo.
- **Decisão consciente, mantida:** nenhum link para QField/QFieldCloud nesta
  página pública — ver Seção 5.6 do Memorial (`CO2-IQ-Monitor_rev8.md`). QField é
  implementação atual, não identidade do produto; expor o link reabriria a
  leitura de "camada em cima de ferramenta de terceiros" que a arquitetura
  foi desenhada para evitar.

## Arquivos (nova convenção — sem sufixos ambíguos)

- `index.html` + `script.js` → versão **canônica**, formulário via
  **Formspree**. É esta a versão que você tem publicado hoje.
- `index-google-forms.html` + `script-google-forms.js` → variante
  alternativa, formulário via **Google Forms**.
- `style.css` → compartilhado pelas duas versões.

> **Publique só uma versão por vez.** Se optar pela variante Google Forms,
> renomeie `index-google-forms.html` para `index.html` antes de subir — o
> GitHub Pages sempre serve o arquivo chamado `index.html` como página
> inicial. Isso evita o mesmo tipo de erro de nome que causou o 404 anterior:
> ao renomear, confira no Windows Explorer se a extensão não duplicou (ex.:
> `index.html.html`) — ative "Mostrar extensões de nome de arquivo" em
> **Visualizar** para conferir o nome real do arquivo.

## Como publicar no GitHub Pages

1. Coloque os arquivos da versão escolhida na pasta que o Pages está
   servindo (no seu caso, `docs/`).
2. Em **Settings → Pages**, confirme que a fonte aponta para essa pasta.
3. Suba (commit + push).
4. Aguarde 1-2 minutos e recarregue com **Ctrl+Shift+R** para ignorar cache.

## Antes de publicar: o que você precisa ajustar

- **Formulário (Formspree):** troque `SEU_ID` na linha `action=` do `<form>`
  em `index.html` pelo endpoint gerado na sua conta em
  [formspree.io](https://formspree.io).
- **Formulário (Google Forms), se optar pela variante alternativa:**
  1. Crie um formulário em [forms.google.com](https://forms.google.com) com
     as perguntas: Nome, E-mail, Empresa, "Qual desafio ambiental você quer
     resolver?" — nessa ordem.
  2. No menu **⋮ → Obter link pré-preenchido**, preencha valores de teste e
     copie o link gerado — ele contém os `entry.NNNNNNNNN` de cada campo.
  3. Substitua `SEU_FORM_ID` e os quatro `ENTRY_ID_...` em
     `index-google-forms.html` pelos valores encontrados.
- **Links normativos:** confirme se `ghgprotocol.org`, `ipcc.ch` e
  `gov.br/mcti` (usado aqui para a página do MCTI) ainda são os endereços
  corretos e mais específicos possíveis antes de publicar.
- **Conteúdo do FAQ:** baseado no Memorial `CO2-IQ-Monitor_rev8.md`. Se o
  memorial mudar de revisão, revise o FAQ manualmente (sem sincronização
  automática nesta fase, por design).

## Sobre o V1.5 (assistente interativo — não incluído nesta versão)

O ponto de montagem já está marcado em `index.html` / `index-google-forms.html`,
logo após a seção de FAQ: `<!-- V1.5 hook: assistant widget mounts here -->`.
Decisão já tomada no briefing: sem base vetorial/RAG complexo (Memorial
embutido direto no prompt de uma função serverless simples) e sem busca na
web ao vivo (assistente responde só sobre o produto). Até lá, o site funciona
de forma completa e independente sem essa peça.

---

## V1.5 — Assistente interativo (ativado nesta versão)

### Estrutura de pastas necessária no repositório

```
seu-repositório/
├── api/
│   └── ask.js              ← função serverless (fica na RAIZ do repo, não em docs/)
└── docs/                    ← pasta servida pelo GitHub Pages
    ├── index.html
    ├── style.css
    ├── script.js
    └── assistant.js
```

O GitHub Pages só enxerga o que está em `docs/` (conforme configurado em
Settings → Pages). A pasta `api/` na raiz é ignorada pelo Pages — ela existe
só para a Vercel encontrar e publicar a função.

### Passo a passo do deploy

1. **Gere uma chave de API:** em [console.anthropic.com](https://console.anthropic.com),
   crie uma chave (Settings → API Keys). Guarde-a — você vai precisar dela
   só uma vez, no passo 4.
2. **Suba `api/ask.js` para a raiz do repositório** (fora de `docs/`), e
   `assistant.js` para dentro de `docs/`, junto dos demais arquivos do site.
3. **Crie um projeto na Vercel:** em [vercel.com](https://vercel.com), conecte
   sua conta do GitHub e importe o repositório `CO2-Landing-Page`. A Vercel
   detecta a pasta `api/` automaticamente — não precisa configurar nada
   além disso na maioria dos casos.
4. **Adicione a variável de ambiente:** no projeto criado, vá em
   **Settings → Environment Variables** e crie:
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: a chave gerada no passo 1
   (Nunca coloque essa chave em nenhum arquivo do repositório — só aqui,
   como variável de ambiente da Vercel.)
5. **Copie a URL do projeto** que a Vercel gerou (algo como
   `https://co2-landing-page.vercel.app`).
6. **Atualize `assistant.js`** (dentro de `docs/`): troque
   `https://SEU-PROJETO.vercel.app/api/ask` pela URL real + `/api/ask` no
   final.
7. Suba essa alteração pro GitHub. O GitHub Pages atualiza o site; a Vercel
   já está de pé, servindo a função.
8. Teste: abra o site publicado, role até "Pergunte diretamente sobre o
   CO2·QField", faça uma pergunta. Se der erro, veja o Console do
   navegador (F12) — mensagens de CORS ou 404 geralmente indicam que a URL
   em `assistant.js` ainda não foi atualizada corretamente.

### Sobre custo

Cada pergunta = uma chamada paga à API da Anthropic (não é coberta pelo
free tier da Vercel, que cobre só a execução da função em si). Para um site
de baixo tráfego em fase de validação, o custo por pergunta é pequeno, mas
não é zero — acompanhe o uso em console.anthropic.com. Se quiser um limite
de segurança, dá para adicionar um contador simples de perguntas por
IP/dia na própria função — avise se quiser que eu adicione isso.

### Sobre o modelo escolhido

A função usa `claude-haiku-4-5-20251001` — modelo mais econômico, adequado
para respostas curtas de FAQ baseadas em um documento fixo. Como nomes e
disponibilidade de modelo podem mudar, confirme o modelo vigente em
[docs.claude.com](https://docs.claude.com/en/docs/about-claude/models)
antes de publicar, e troque no `api/ask.js` se necessário.
