# CO2·QField — Landing Page de Validação (V1)

Site estático, sem login, sem backend. Objetivo: testar a recepção do produto
junto às personas-alvo (analistas ambientais, gestores de planta, auditores,
investidores) antes de qualquer definição de preço ou modelo comercial.

## Arquivos

- `index.html` — estrutura e conteúdo (hero, dores/soluções, fluxo, FAQ, formulário)
- `style.css` — design system (graphite industrial + verde ambiental)
- `script.js` — accordion do FAQ, animação de entrada, e o hook comentado para o V1.5

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `co2qfield-landing`).
2. Coloque estes três arquivos na raiz do repositório (ou em uma pasta `/docs`).
3. No repositório: **Settings → Pages → Source** → selecione a branch (`main`) e a
   pasta (`/root` ou `/docs`, conforme onde você colocou os arquivos).
4. Em alguns minutos o site estará no ar em
   `https://SEU-USUARIO.github.io/co2qfield-landing/`.
5. (Opcional) Em **Settings → Pages → Custom domain**, aponte um domínio próprio.

## Antes de publicar: o que você precisa ajustar

- **Formulário de contato (Google Forms):** o `<form>` em `index.html` envia direto
  para o Google Forms — sem precisar de conta em serviço nenhum além do Google, que
  você já usa. Siga os passos abaixo antes de publicar:

  ### Passo a passo — Google Forms

  1. Acesse [forms.google.com](https://forms.google.com) e crie um formulário novo,
     com estas quatro perguntas, **nessa ordem** (o tipo de campo entre parênteses):
     1. `Nome` (resposta curta)
     2. `E-mail` (resposta curta)
     3. `Empresa` (resposta curta)
     4. `Qual desafio ambiental você quer resolver?` (parágrafo)
  2. Clique no ícone de **⋮ (mais opções)** no canto superior direito → **"Obter link
     pré-preenchido"**.
  3. Preencha qualquer valor de teste em cada campo (ex.: "teste") e clique em
     **"Obter link"**, depois **"Copiar link"**.
  4. Cole esse link em qualquer lugar (bloco de notas, por exemplo). Ele terá esse
     formato, com números longos:
     ```
     https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url&entry.111111111=teste&entry.222222222=teste&entry.333333333=teste&entry.444444444=teste
     ```
  5. Identifique qual `entry.NNNNNNNNN` corresponde a qual pergunta (a ordem no link
     segue a ordem das perguntas no formulário — o primeiro é Nome, o segundo E-mail,
     e assim por diante).
  6. Em `index.html`, na seção `id="interesse"`, substitua:
     - `SEU_FORM_ID` na linha `action="https://docs.google.com/forms/d/e/SEU_FORM_ID/formResponse"`
       pelo trecho `1FAIpQLSc...` do seu link (a parte entre `/d/e/` e `/viewform`).
     - `ENTRY_ID_NOME`, `ENTRY_ID_EMAIL`, `ENTRY_ID_EMPRESA`, `ENTRY_ID_DESAFIO`
       (nos atributos `name="entry.ENTRY_ID_..."`) pelos números que você identificou
       no passo 5 — mantendo o prefixo `entry.` (ex.: `name="entry.111111111"`).
  7. As respostas cairão automaticamente numa aba de **Respostas** dentro do próprio
     Google Forms, e você pode vincular a uma planilha do Google Sheets clicando no
     ícone verde de Sheets ali dentro.

  Como o envio acontece por baixo dos panos (num iframe escondido, sem sair da
  página), o site sempre mostra "Recebido — obrigado pelo contato." depois do envio
  — não há como confirmar 100% se o Google aceitou por causa de uma restrição de
  navegador (CORS) entre domínios diferentes. Isso é normal e esperado nesse tipo de
  integração; teste enviando uma vez e conferindo se a resposta aparece no Forms.
- **Conteúdo do FAQ:** as perguntas e respostas foram escritas com base no
  Memorial Descritivo `CO2-QField_rev7.md`. Se o memorial mudar de revisão,
  revise o FAQ manualmente — é intencional que não haja sincronização
  automática nesta fase (evita risco de desalinhamento silencioso).

## Sobre o V1.5 (assistente interativo — não incluído nesta versão)

Esta V1 foi estruturada para receber o assistente de IA no futuro, **se** a
validação mostrar demanda suficiente para justificá-lo (ver critério na seção
"V1.5" do briefing consolidado). Quando isso acontecer:

1. O ponto de montagem já está marcado em `index.html`, logo após a seção de
   FAQ: `<!-- V1.5 hook: assistant widget mounts here -->`.
2. A lógica de chamada já está esboçada, comentada, no final de `script.js`.
3. **Decisão já tomada no briefing:** sem base vetorial/RAG complexo — o
   Memorial é curto o bastante para ser embutido inteiro no prompt de uma
   função serverless simples (ex.: Vercel, plano Hobby/free). Sem busca na
   web ao vivo — o assistente responde só sobre o produto, com base no
   Memorial, para não citar norma desatualizada na frente de auditores.

Até lá, o site funciona de forma completa e independente sem essa peça.
