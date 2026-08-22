import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const MEMORIAL_FILENAME = "CO2-QField_rev7.md";
const MEMORIAL_REMOTE =
  process.env.MEMORIAL_URL ||
  "https://raw.githubusercontent.com/iqdeepsearch/CO2-Landing-Page/main/CO2-QField_rev7.md";

const UNDOCUMENTED_ANSWER =
  "Essa informação ainda não está documentada no memorial do produto. Envie sua dúvida pelo formulário de contato, mais abaixo nesta página, para que possamos responder.";

function readMemorialFromDisk() {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(process.cwd(), MEMORIAL_FILENAME),
    join(here, "..", MEMORIAL_FILENAME),
    join(here, MEMORIAL_FILENAME),
    join(here, "..", "..", MEMORIAL_FILENAME),
  ];

  for (const filePath of candidates) {
    try {
      const text = readFileSync(filePath, "utf8").trim();
      if (text) return { text, filePath };
    } catch {
      // tenta o próximo caminho
    }
  }

  return null;
}

async function loadMemorial() {
  const fromDisk = readMemorialFromDisk();
  if (fromDisk) return fromDisk;

  const res = await fetch(MEMORIAL_REMOTE, {
    headers: {
      Accept: "text/plain",
      "User-Agent": "co2-qfield-assistant",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Memorial remoto indisponível (${res.status}): ${MEMORIAL_REMOTE}`
    );
  }

  const text = (await res.text()).trim();
  if (!text) {
    throw new Error("Memorial remoto veio vazio.");
  }

  return { text, filePath: MEMORIAL_REMOTE };
}

let memorialCache = null;

async function getMemorial() {
  if (process.env.NODE_ENV === "production" && memorialCache) {
    return memorialCache;
  }
  memorialCache = await loadMemorial();
  return memorialCache;
}

function buildSystemPrompt(memorial) {
  return `Você é o assistente de perguntas frequentes do site institucional do CO2·QField.

REGRAS:
1. Responda apenas com base no Memorial Descritivo abaixo. Não use conhecimento externo e não invente seções, números, prazos ou funcionalidades.
2. Se a pergunta não puder ser respondida com o que está no Memorial, responda exatamente com esta mensagem:
"${UNDOCUMENTED_ANSWER}"
3. Tom estritamente corporativo e técnico.
4. Não especule sobre preço, prazos ou lançamento comercial. Se o memorial não documentar isso, use a mensagem da regra 2.
5. Respostas curtas e diretas (3-4 frases), em português brasileiro.
6. Perguntas sobre o que a V1 faz ou não faz devem consultar a seção de limites de escopo do memorial. Se o memorial afirma que algo está fora da V1 (créditos de carbono, marketplace, telemetria IoT contínua, etc.), diga isso claramente. Nesses casos, não use a mensagem da regra 2.

MEMORIAL DESCRITIVO:
${memorial}`;
}

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

  let memorial;
  try {
    memorial = await getMemorial();
  } catch (err) {
    console.error(err);
    if (req.method === "GET") {
      const hasKey = Boolean(
        process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
      );
      return res.status(200).json({ ok: false, hasKey, hasMemorial: false });
    }
    return res.status(500).json({
      error: "Memorial descritivo indisponível para o assistente.",
    });
  }

  if (req.method === "GET") {
    const hasKey = Boolean(
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    );
    return res.status(200).json({
      ok: true,
      hasKey,
      hasMemorial: true,
      memorialBytes: Buffer.byteLength(memorial.text, "utf8"),
      memorialSource: memorial.filePath,
    });
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
    const payload = {
      model: "gemini-3.7-flash",
      contents: question,
      config: {
        systemInstruction: buildSystemPrompt(memorial.text),
        maxOutputTokens: 800,
      },
    };

    let response;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent(payload);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        const msg = String(err?.message || "");
        const retryable =
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("503");
        if (!retryable || attempt === 3) throw err;
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
    if (lastErr) throw lastErr;

    const answer = response.text || UNDOCUMENTED_ANSWER;
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Erro na API do Gemini:", err);
    const detail = err?.message ? String(err.message).slice(0, 300) : undefined;
    return res.status(500).json({
      error: "Falha ao consultar o assistente. Tente novamente em instantes.",
      detail,
    });
  }
}
