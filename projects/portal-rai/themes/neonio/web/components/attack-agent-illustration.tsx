import { IllustrationFrame } from "./illustration-frame";

// A branch off the conversation line (.uk-br-l): only the sides each one draws have a width.
const branch = "absolute border-faint";
// A labeled tag on the drawing (.uk-br-chip), centered on its own top coordinate.
const chip =
  "absolute inline-flex h-4.75 -translate-y-1/2 items-center whitespace-nowrap border px-1.5 text-10-5 leading-1000";
const quietChip = `${chip} border-subtle bg-page text-muted`;
// A turn of the conversation on the line (.uk-dot), centered on its coordinates.
const dot = "absolute top-[58%] -mt-0.75 -ml-0.75 size-1.75 rounded-circle bg-red";

// Agente de Ataque: the conversation with the service agent runs along one red line, and the attack
// agent opens detours from it, each a strategy (persona swap, indirect injection, obfuscation), that
// come back to the conversation.
export function AttackAgentIllustration() {
  return (
    <IllustrationFrame
      label="Ilustração: a conversa com o agente de atendimento segue numa linha e o agente de ataque abre desvios de estratégia, troca de persona, injeção indireta e ofuscação, que voltam para a conversa."
      className="bg-ruled"
    >
      <span
        className={`${branch} top-[16%] left-[34%] h-[42%] w-[6%] rounded-tl-6 border-t border-l`}
      />
      <span
        className={`${branch} top-[16%] left-[81%] h-[42%] w-[11%] rounded-tr-6 border-t border-r`}
      />
      <span
        className={`${branch} top-[36%] left-[38%] h-[22%] w-[6%] rounded-tl-6 border-t border-l`}
      />
      <span
        className={`${branch} top-[36%] left-[85%] h-[22%] w-[3%] rounded-tr-6 border-t border-r`}
      />
      <span
        className={`${branch} top-[58%] left-[46%] h-[26%] w-[6%] rounded-bl-6 border-b border-l`}
      />
      <span
        className={`${branch} top-[58%] left-[77%] h-[26%] w-[6%] rounded-br-6 border-r border-b`}
      />
      <span aria-hidden="true" className="absolute inset-x-0 top-[58%] h-px bg-red" />
      <span className={`${quietChip} top-[16%] left-[40%]`}>troca-de-persona</span>
      <span className={`${quietChip} top-[36%] left-[44%]`}>injeção-indireta</span>
      <span className={`${quietChip} top-[84%] left-[52%]`}>ofuscação</span>
      <span className={`${chip} top-[58%] left-0 border-red bg-red text-page`}>atendimento</span>
      <span className={`${dot} left-[34%]`} />
      <span className={`${dot} left-[38%]`} />
      <span className={`${dot} left-[46%]`} />
      <span className={`${dot} left-[83%]`} />
      <span className={`${dot} left-[88%]`} />
      <span className={`${dot} left-[92%]`} />
    </IllustrationFrame>
  );
}
