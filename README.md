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
  página pública — ver Seção 5.6 do Memorial (`CO2-QField_rev7.md`). QField é
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
- **Conteúdo do FAQ:** baseado no Memorial `CO2-QField_rev7.md`. Se o
  memorial mudar de revisão, revise o FAQ manualmente (sem sincronização
  automática nesta fase, por design).

## Sobre o V1.5 (assistente interativo — não incluído nesta versão)

O ponto de montagem já está marcado em `index.html` / `index-google-forms.html`,
logo após a seção de FAQ: `<!-- V1.5 hook: assistant widget mounts here -->`.
Decisão já tomada no briefing: sem base vetorial/RAG complexo (Memorial
embutido direto no prompt de uma função serverless simples) e sem busca na
web ao vivo (assistente responde só sobre o produto). Até lá, o site funciona
de forma completa e independente sem essa peça.
