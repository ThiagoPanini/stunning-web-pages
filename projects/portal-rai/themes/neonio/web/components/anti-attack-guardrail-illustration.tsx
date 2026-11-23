import { IllustrationFrame } from "./illustration-frame";

// The input guardrails that judged a message, with the score and the verdict of each.
const ROWS = [
  { guardrail: "jailbreak", score: "—", verdict: "liberada" },
  { guardrail: "prompt_injection", score: "0,93", verdict: "bloqueada", blocked: true },
  { guardrail: "pii", score: "—", verdict: "liberada" },
  { guardrail: "escopo", score: "—", verdict: "liberada" },
];

// A row of the verdict table (.uk-krow): three columns, each cut with an ellipsis if it runs long.
const row =
  "grid h-6.5 grid-cols-verdict items-center gap-2 whitespace-nowrap px-1.5 *:overflow-hidden *:text-ellipsis";

// Guardrail Antiataque: the input guardrails judge a message; prompt injection scores 0,93 and blocks
// it, the others let it through.
export function AntiAttackGuardrailIllustration() {
  return (
    <IllustrationFrame
      label="Ilustração: guardrails de entrada avaliam uma mensagem; prompt injection dá score 0,93 e bloqueia; jailbreak, PII e escopo liberam."
      className="flex flex-col justify-center"
    >
      <div className={`${row} text-10-5 text-subtle`}>
        <span>guardrail</span>
        <span>score</span>
        <span>veredito</span>
      </div>
      {ROWS.map(({ guardrail, score, verdict, blocked }) => (
        <div
          key={guardrail}
          className={`${row} text-11-5 ${blocked ? "bg-blue text-page" : "text-subtle"}`}
        >
          <span>{guardrail}</span>
          <span>{score}</span>
          <span>{verdict}</span>
        </div>
      ))}
    </IllustrationFrame>
  );
}
