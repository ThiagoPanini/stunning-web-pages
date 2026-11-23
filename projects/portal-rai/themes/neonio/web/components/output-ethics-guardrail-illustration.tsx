import { IllustrationFrame } from "./illustration-frame";

// A blue corner of the selected square (.uk-corner) and a handle of the outer one (.uk-handle), each
// centered on its coordinates.
const corner = "absolute -mt-0.5 -ml-0.5 size-1.25 bg-blue";
const handle = "absolute -mt-1 -ml-1 size-2.25 border border-subtle bg-page";

// Guardrail Ética Saída: the agent's answer, a blue square, passes through the output guardrail, the
// selected frame around it, before it reaches the customer.
export function OutputEthicsGuardrailIllustration() {
  return (
    <IllustrationFrame label="Ilustração: a resposta do agente passa pelo guardrail de saída antes de chegar ao cliente.">
      <span
        aria-hidden="true"
        className="absolute top-[16%] left-[6%] h-px w-[82%] bg-rule-subtle"
      />
      <span
        aria-hidden="true"
        className="absolute top-[8%] left-[12%] h-[82%] w-px bg-rule-subtle"
      />
      <span className="absolute top-[16%] left-[12%] h-[72%] w-[64%] border border-rule" />
      <span className="absolute top-[36%] left-[30%] h-[40%] w-[34%] border border-rule" />
      <span className="absolute top-[26%] left-[22%] h-[56%] w-[50%] border border-blue" />
      <span className={`${corner} top-[26%] left-[22%]`} />
      <span className={`${corner} top-[26%] left-[72%]`} />
      <span className={`${corner} top-[82%] left-[22%]`} />
      <span className={`${corner} top-[82%] left-[72%]`} />
      <span
        aria-hidden="true"
        className="absolute top-[54%] left-[47%] size-9 -translate-1/2 bg-blue"
      />
      <span className={`${handle} top-[16%] left-[76%]`} />
      <span className={`${handle} top-[88%] left-[12%]`} />
    </IllustrationFrame>
  );
}
