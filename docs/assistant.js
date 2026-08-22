// ============================================================
// CO2·QField — V1.5: widget do assistente de FAQ
// ============================================================
// GitHub Pages (origem) chama a função serverless na Vercel.
// Use o domínio de produção do projeto, nunca a URL de preview
// (…-hash-….vercel.app): preview costuma exigir login e devolve 401.
// ============================================================

const ASSISTANT_ENDPOINT =
  "https://co-2-landing-page-iqdeepsearch.vercel.app/api/ask";

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

    try {
      const res = await fetch(ASSISTANT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : {};

      if (res.status === 401 || res.status === 403) {
        throw new Error(
          "A API na Vercel está protegida por login (Deployment Protection). " +
            "Em vercel.com, abra o projeto → Settings → Deployment Protection e " +
            "desative a autenticação em Production."
        );
      }

      if (!res.ok) {
        throw new Error(data.error || "Falha ao consultar o assistente.");
      }

      if (!data.answer) {
        throw new Error("A API respondeu sem o campo answer.");
      }

      showAnswer("ok", data.answer);
    } catch (err) {
      const fallback =
        err && err.message
          ? err.message
          : "Não foi possível obter uma resposta agora. Tente novamente em instantes, ou use o formulário de contato abaixo.";
      showAnswer("error", fallback);
    }
  });
}
