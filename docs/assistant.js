// ============================================================
// CO2·QField — V1.5: widget do assistente de FAQ
// ============================================================
// Chama a função serverless hospedada na Vercel (não a API da Gemini
// diretamente — isso exporia a chave de API no navegador de qualquer
// visitante).
//
// IMPORTANTE: troque a URL abaixo pela URL real do seu projeto na Vercel
// depois do deploy (ver README.md § "V1.5").
// ============================================================

const ASSISTANT_ENDPOINT = "https://co-2-landing-page-pzirq9h61-iqdeepsearch.vercel.app";

const assistantForm = document.getElementById("assistant-form");
const assistantQuestion = document.getElementById("assistant-question");
const assistantAnswer = document.getElementById("assistant-answer");

if (assistantForm) {
  assistantForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = assistantQuestion.value.trim();
    if (!question) return;

    assistantAnswer.hidden = false;
    assistantAnswer.className = "assistant__answer assistant__answer--loading";
    assistantAnswer.textContent = "Consultando o memorial do produto…";

    try {
      const res = await fetch(ASSISTANT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao consultar o assistente.");
      }

      assistantAnswer.className = "assistant__answer";
      assistantAnswer.textContent = data.answer;
    } catch (err) {
      assistantAnswer.className = "assistant__answer assistant__answer--error";
      assistantAnswer.textContent =
        "Não foi possível obter uma resposta agora. Tente novamente em instantes, ou use o formulário de contato abaixo.";
    }
  });
}
