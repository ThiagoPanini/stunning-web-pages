// What the team does, in three steps: each one is a word of the title and a column below it.
const steps = [
  {
    title: "Pesquisar",
    body: "Estudamos como agentes conversacionais falham: jailbreaks, prompt injection, vazamento de dados e respostas fora da política.",
    reveal: "reveal-1",
  },
  {
    title: "Desenvolver",
    body: "Transformamos cada falha conhecida em um guardrail testável, versionado e medido antes de chegar a qualquer cliente.",
    reveal: "reveal-2",
  },
  {
    title: "Implementar",
    body: "Colocamos os guardrails em produção, dentro da conversa entre clientes e agentes, e acompanhamos o resultado todos os dias.",
    reveal: "reveal-3",
  },
];

// 01 · Missão: the large title whose words light up one after the other while it crosses the view, and
// three columns that rise into place, staggered, as they enter it. Keep data-block="mission": the tests
// find the block by it.
export function Mission() {
  return (
    <section data-block="mission" className="flex flex-col gap-16 border-rule border-t py-24">
      <div className="flex flex-col gap-6">
        <div className="font-mono text-12 text-subtle uppercase tracking-wide-80">01 · Missão</div>
        <h2 className="max-w-275 font-light text-36-92 leading-103 tracking-tight-40">
          <span className="light-up-1">Pesquisar, </span>
          <span className="light-up-2">desenvolver, </span>
          <span className="light-up-3">implementar.</span>
        </h2>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-x-10 gap-y-8">
        {steps.map((step) => (
          <div
            key={step.title}
            className={`${step.reveal} flex flex-col gap-2.5 border-rule-strong border-t pt-5`}
          >
            <h3 className="font-normal text-20 tracking-tight-10">{step.title}</h3>
            <p className="text-pretty text-15 text-muted leading-160">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
