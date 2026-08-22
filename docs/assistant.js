// ============================================================
// CO2·QField — V1.5: widget do assistente de FAQ
// ============================================================
// Consulta a função na Vercel, que responde com base no
// Memorial Descritivo. Sem cola local: se a API falhar, pede
// o formulário de contato.
// ============================================================

const ASSISTANT_ENDPOINT =
  "https://co-2-landing-page-iqdeepsearch.vercel.app/api/ask";

const API_UNAVAILABLE =
  "Não foi possível consultar o memorial agora. Envie sua dúvida pelo formulário de contato, mais abaixo nesta página, para que possamos responder.";

async function askApi(question) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);

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

  if (
    (kind === "ok" || kind === "error") &&
    /formul[aá]rio de (contato|coment[aá]rios)/i.test(text)
  ) {
    const link = document.createElement("a");
    link.href = "#interesse";
    link.className = "assistant__form-link";
    link.textContent = "Abrir formulário de comentários";
    assistantAnswer.appendChild(document.createTextNode("\n"));
    assistantAnswer.appendChild(link);
  }
}

if (assistantForm) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = assistantQuestion.value.trim();
    if (!question) return;

    showAnswer("loading", "Consultando o memorial do produto…");

    const remote = await askApi(question);
    if (remote) {
      showAnswer("ok", remote);
    } else {
      showAnswer("error", API_UNAVAILABLE);
    }
  });
}
