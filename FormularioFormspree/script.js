// ============================================================
// CO2·QField — V1, variante Formspree (estática, sem backend próprio)
// ============================================================

// --- FAQ accordion ---
document.querySelectorAll(".faq__question").forEach((btn) => {
  const answer = btn.nextElementSibling;

  btn.addEventListener("click", () => {
    const isOpen = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!isOpen));
    answer.style.maxHeight = isOpen ? null : answer.scrollHeight + "px";
  });
});

// --- Scroll reveal for section blocks ---
const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window && revealTargets.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// ============================================================
// V1.5 HOOK (não ativo nesta versão)
//
// Quando o assistente interativo for construído, ele deve:
//   1. Montar sua UI no placeholder comentado em index.html,
//      logo após a seção #faq ("<!-- V1.5 hook: ... -->").
//   2. Ao receber uma pergunta do visitante, chamar uma função
//      serverless (ex.: Vercel) via fetch(), NUNCA a API da
//      Anthropic diretamente do navegador (isso exporia a chave).
//   3. A função serverless deve montar o prompt com o conteúdo
//      do Memorial Descritivo embutido como contexto fixo —
//      sem base vetorial e sem busca na web (ver briefing V1.5
//      para o racional dessa decisão).
//
// Exemplo do fetch que a UI do V1.5 faria (não usado na V1):
//
// async function askAssistant(question) {
//   const res = await fetch("https://SEU-PROJETO.vercel.app/api/ask", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ question }),
//   });
//   return res.json();
// }
// ============================================================
