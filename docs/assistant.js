// ============================================================
// CO2·QField — V1.5: widget do assistente de FAQ
// ============================================================
// Tenta a função na Vercel. Se o deploy estiver com SSO
// (Failed to fetch / 401), responde no browser com o memorial.
// ============================================================

const ASSISTANT_ENDPOINT =
  "https://co-2-landing-page-iqdeepsearch.vercel.app/api/ask";

const MEMORIAL_SECTIONS = [
  {
    keys: ["consiste", "projeto", "conceito", "o que e", "oque e", "sobre", "solucao", "produto"],
    answer:
      "O CO2·QField é uma solução vertical de inteligência geoespacial e automação ambiental para o setor industrial. Integra identificação de ativos via QR Code, captura automática de GPS de alta precisão, cálculo autônomo de emissões de CO₂ (Escopos 1 e 2) e publicação em dashboard web por planta. O objetivo é eliminar planilhas e pranchetas, transformando inspeções de campo em um fluxo contínuo de dados auditáveis.",
  },
  {
    keys: ["publico", "cliente", "icp", "industria", "consultoria", "para quem"],
    answer:
      "O público-alvo primário são indústrias de médio porte (cerâmicas, alimentícias, metalúrgicas, cimenteiras regionais e frigoríficos) que precisam de conformidade ambiental sem equipe interna de software ou GIS. O canal de entrada é B2B2B: consultorias ambientais usam o pipeline em campo e entregam o dashboard às indústrias clientes. Cada planta opera em instância single-tenant.",
  },
  {
    keys: ["isolamento", "planta", "schema", "tenant", "dados", "outra planta", "seguranca"],
    answer:
      "Os dados de uma planta não são visíveis por outra. O isolamento é físico no banco: schema PostgreSQL dedicado e role de serviço exclusiva por planta, não RLS sobre um schema compartilhado. Fatores de emissão ficam no schema core, somente-leitura. Os schemas sensíveis ficam fora da API PostgREST.",
  },
  {
    keys: ["escopo", "ghg", "protocol", "ipcc", "mcti", "sin", "norma", "iso", "14064"],
    answer:
      "O inventário segue o GHG Protocol Corporate Standard nos Escopos 1 e 2, com ABNT NBR ISO 14064-1 e diretrizes do IPCC. Escopo 1 cobre combustão estacionária; Escopo 2, eletricidade da rede com fatores do SIN publicados pelo MCTI. Fatores são versionados e nunca sobrescritos.",
  },
  {
    keys: ["fator", "fatores", "vigencia", "atualiza", "append"],
    answer:
      "Os fatores ficam em core.fatores_emissao, tabela append-only: nenhuma linha sofre UPDATE. O fator vigente na data da coleta é resolvido por vigencia_inicio (mais recente menor ou igual ao timestamp), não por vigencia_fim. Isso preserva auditoria retroativa.",
  },
  {
    keys: ["offline", "internet", "campo", "qr", "gps", "operador", "coleta"],
    answer:
      "A coleta em campo funciona offline-first e sincroniza quando houver rede. O fluxo é escanear o QR Code do ativo; GPS, timestamp e identificação do operador entram no payload automaticamente, sem digitação. A governança (schema, roles, estados) fica no banco, não no app de captura.",
  },
  {
    keys: ["alterar", "imutavel", "append", "auditoria", "status", "validado", "exportado", "rascunho"],
    answer:
      "Registros de campo são append-only: não há sobrescrita silenciosa. A máquina de estados tem quatro fases — rascunho, calculado, validado e exportado — imposta por trigger no banco. Correções e validações ocorrem por transição de status rastreável, com roles de escrita disjuntas.",
  },
  {
    keys: ["preco", "preço", "valor", "assinatura", "comercial", "quando", "disponivel", "disponível"],
    answer:
      "Preço, prazos e modelo comercial ainda não estão definidos. O produto está em fase de validação com potenciais usuários; essa etapa vem depois. As funcionalidades descritas refletem o desenho técnico atual, já formalizado no memorial.",
  },
  {
    keys: ["roi", "economia", "multa", "custo", "retorno"],
    answer:
      "O memorial estima, por planta: R$ 12 mil a R$ 18 mil/ano em horas técnicas; R$ 20 mil a R$ 60 mil/ano em combustível por detecção de queima incompleta; e mitigação de autuações na faixa de R$ 10 mil a mais de R$ 100 mil. São estimativas de impacto do desenho, não uma oferta comercial.",
  },
];

const FALLBACK_ANSWER =
  "Essa informação ainda não está documentada de forma específica no memorial público. O CO2·QField cobre coleta em campo (QR + GPS), cálculo de Escopos 1 e 2, isolamento por planta e trilha de auditoria. Reformule a pergunta sobre um desses temas, ou use o formulário de contato.";

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function answerFromMemorial(question) {
  const q = normalize(question);
  let best = { score: 0, answer: FALLBACK_ANSWER };

  for (const section of MEMORIAL_SECTIONS) {
    let score = 0;
    for (const key of section.keys) {
      if (q.includes(key)) score += 2;
    }
    if (score > best.score) best = { score, answer: section.answer };
  }

  return best.answer;
}

async function askApi(question) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(ASSISTANT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : {};

    if (!res.ok || !data.answer) return null;
    return data.answer;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const assistantForm = document.getElementById("assistant-form");
const assistantQuestion = document.getElementById("assistant-question");
const assistantAnswer = document.getElementById("assistant-answer");

function showAnswer(kind, text) {
  assistantAnswer.hidden = false;
  assistantAnswer.className =
    kind === "error"
      ? "assistant__answer assistant__answer--error"
      : kind === "loading"
        ? "assistant__answer assistant__answer--loading"
        : "assistant__answer";
  assistantAnswer.textContent = text;
}

if (assistantForm) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = assistantQuestion.value.trim();
    if (!question) return;

    showAnswer("loading", "Consultando o memorial do produto…");

    const remote = await askApi(question);
    showAnswer("ok", remote || answerFromMemorial(question));
  });
}
