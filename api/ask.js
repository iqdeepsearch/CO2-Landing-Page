import { GoogleGenAI } from "@google/genai";

const MEMORIAL = `
# Memorial Descritivo: Sistema Automatizado de Monitoramento de Emissões de CO₂ Industrial Baseado em Geolocalização e Código de Rastreio (V6)

**Versão:** 7.0 | **Status:** Bloco 1 (Schema, Governança e Máquina de Estados) Formalizado em DDL — Máquina de Estados de 4 Fases, Roles de Serviço Completas e Auditoria de Exportação Consolidadas. Próxima Etapa: Sandbox/PoC de Sincronização QFieldCloud.

> **Nota de revisão (Rev 7):** Esta revisão não altera a arquitetura de dados do Bloco 1. Ela formaliza, em texto, um princípio que já era verdadeiro na prática: a governança (schema, roles, máquina de estados) pertence ao banco de dados, não ao aplicativo de captura em campo. Dois ajustes cosméticos foram feitos para que a nomenclatura reflita isso — (i) a role de escrita bruta por planta deixou de levar o nome do app (\`qfield_{planta_id}\` → \`field_ingest_{planta_id}\`); (ii) a captura do nome do operador é descrita como regra de negócio do payload, não mais como uma expressão específica do QGIS/QField. Uma nova Seção 5.6 formaliza o princípio de Ingestão Desacoplada. Nenhum GRANT, trigger ou nome de coluna foi alterado.

---

## 1. Conceito do Projeto e Posicionamento Estratégico

O projeto consiste em uma solução vertical de inteligência geoespacial e automação ambiental voltada para o setor industrial. O sistema integra a identificação física unívoca de ativos fabris via QR Code, a captura automatizada de coordenadas geográficas de alta precisão (Latitude e Longitude), o processamento analítico autônomo de taxas de emissão de dióxido de carbono (CO₂) e a publicação instantânea desses dados em um painel (dashboard) web interativo dedicado por planta fabril.

A proposta central é eliminar processos manuais, planilhas isoladas e a demora no ciclo de inventários ambientais, transformando inspeções de campo rotineiras em um fluxo contínuo de dados estruturados para tomada de decisão sustentável, eficiência operacional e auditoria de conformidade.

---

## 2. Perfil de Cliente Ideal (ICP) e Modelo de Mercado

A solução é calibrada especificamente para atender a lacuna entre ferramentas de coleta genéricas e softwares enterprise de alto custo:

* **Público-Alvo Primário (Usuário Final):** Indústrias de Médio Porte (ex.: cerâmicas, alimentícias, metalúrgicas, cimenteiras regionais e frigoríficos) que necessitam de conformidade ambiental rigorosa, mas não possuem equipes internas de desenvolvimento de software ou analistas de GIS dedicados.
* **Canal Estratégico de Entrada (Multiplicador B2B2B):** Consultorias Ambientais especializadas em inventários de emissões e licenciamento. As consultorias utilizam o pipeline para acelerar suas operações de campo e entregam o dashboard web como produto de alto valor agregado para suas indústrias clientes.
* **Modelo de Instância:** Arquitetura Single-Tenant por planta fabril, com isolamento garantido no nível de banco de dados por meio de schema PostgreSQL dedicado e role de serviço exclusiva por planta. Cada unidade produtiva opera com governança e parametrização individual, com dados de fatores de emissão centralizados em um schema compartilhado somente-leitura.

---

## 3. Justificativa de Negócio e Impacto Econômico ($)

O valor agregado do produto é fundamentado na economia direta de horas técnicas, mitigação de riscos regulatórios e eficiência térmica/operacional:

| Pilar de Retorno (ROI) | Gargalo Sem a Solução vs. Ganho com o Sistema | Impacto Financeiro Estimado |
| :--- | :--- | :--- |
| **Mão de Obra Técnica** | Eliminação de 15 a 20 horas mensais gastas por analistas na transcrição de planilhas. | Economia de **R$ 12.000 a R$ 18.000 / ano** por planta. |
| **Eficiência de Combustível** | Identificação imediata de queima incompleta e desregulações via alertas no dashboard. | Economia de **R$ 20.000 a R$ 60.000 / ano**. |
| **Mitigação de Multas** | Rastreabilidade jurídica (GPS, timestamp e QR Code), evitando inconsistências. | Mitigação de autuações de **R$ 10.000 a > R$ 100.000**. |

---

## 4. Dores (Pain Points) Resolvidas

* Eliminação de processos manuais (pranchetas e planilhas desconectadas).
* Visibilidade de desvios operacionais em tempo real.
* Operação em áreas sem conectividade (Offline-First).
* Imutabilidade dos registros de campo para auditorias.
* Consolidação de todos os pontos de emissão em interface única com mapas interativos.

---

## 5. Metodologias e Normas

O sistema é estruturado conforme o GHG Protocol Corporate Standard (Escopos 1 e 2), ABNT NBR ISO 14064-1, Diretrizes do IPCC e fatores de emissão do SIN (MCTI). Cada dado é versionado e imutável no banco de dados.

---

## 6. Estrutura de Etapas da Esteira de Dados

1. **Design (QGIS):** Modelagem e validação dos formulários.
2. **Coleta (Campo):** QR Code + GPS + Timestamp automático.
3. **Sincronização:** Aplicação direta de deltas no PostgreSQL.
4. **Cálculo (Motor Python):** Resolução do fator de emissão vigente e processamento conforme GHG Protocol.
5. **Validação:** Workflow de 4 fases (rascunho -> calculado -> validado -> exportado).
6. **Dashboard (Web):** Visualização e alertas.
`;

const SYSTEM_PROMPT = `Você é o assistente de perguntas frequentes do site institucional do CO2·QField.
REGRAS:
1. Responda apenas com base no Memorial Descritivo fornecido.
2. Se a pergunta não estiver no Memorial, diga que a informação ainda não está documentada.
3. Tom estritamente corporativo e técnico.
4. Não especule sobre preço, prazos ou lançamento comercial.
5. Respostas curtas e diretas (3-4 frases).

MEMORIAL: ${MEMORIAL}`;

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function readQuestion(req) {
  const body = req.body;
  if (!body) return undefined;
  if (typeof body === "string") {
    try {
      return JSON.parse(body).question;
    } catch {
      return undefined;
    }
  }
  return body.question;
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
    return res.status(200).json({ ok: true, hasKey });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const question = readQuestion(req);

  if (!question || typeof question !== "string" || question.length > 500) {
    return res.status(400).json({ error: "Pergunta inválida ou ausente." });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY / GOOGLE_API_KEY ausente.");
    return res.status(500).json({
      error: "Chave da API Gemini não configurada no ambiente da Vercel.",
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 400,
      },
    });

    const answer = response.text || "Não foi possível gerar uma resposta.";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Erro na API do Gemini:", err);
    return res.status(500).json({
      error: "Falha ao consultar o assistente. Tente novamente em instantes.",
    });
  }
}
