import { Accordion } from "@base-ui/react/accordion";
import type { ReactNode } from "react";
import { InertLink } from "./inert-link";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

// A link inside an answer, to a screen the design left open (rf-faq-a a).
function AnswerLink({ children }: { children: ReactNode }) {
  return <InertLink className="text-cream underline underline-offset-3">{children}</InertLink>;
}

const QUESTIONS: { question: string; answer: ReactNode }[] = [
  {
    question: "O que o time de Responsible AI faz?",
    answer:
      "Pesquisa, desenvolve e implementa os guardrails dos agentes conversacionais de IA da companhia: do ataque simulado à proteção de cada conversa em produção.",
  },
  {
    question: "Qual a diferença entre Red Team e Blue Team?",
    answer:
      "O Red Team ataca os agentes antes da produção, com adversários simulados, e procura a falha. O Blue Team protege cada conversa em produção e fecha a falha. O que um descobre vira o backlog do outro, a cada nova versão de agente.",
  },
  {
    question: "O que os guardrails de entrada avaliam?",
    answer:
      "A mensagem do cliente, antes de ela chegar ao agente: prompt injection, jailbreak, PII e escopo.",
  },
  {
    question: "E os guardrails de saída?",
    answer:
      "A resposta do agente, antes de ela chegar ao cliente: política, PII e fundamentação, para que siga os princípios éticos e as políticas da companhia.",
  },
  {
    question: "Como testo um guardrail?",
    answer: (
      <>
        No <AnswerLink>Playground</AnswerLink>: cole uma mensagem, escolha os guardrails e veja o
        veredito de cada um. Ou deixe o agente de ataque do Red Team tentar primeiro.
      </>
    ),
  },
  {
    question: "Como acompanho os resultados?",
    answer: (
      <>
        Em <AnswerLink>Dados</AnswerLink>: acionamentos, falsos positivos e latência de cada
        guardrail, todos os dias. Para levar os guardrails ao seu agente, veja as{" "}
        <AnswerLink>Integrações</AnswerLink>.
      </>
    ),
  },
];

// The plus of each question, which turns 45° into a cross while the question is open.
function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

// Perguntas frequentes (6): an accordion whose questions open and close each on its own, the first one
// open on arrival (rf-faq). Each question is a heading with a button that says whether it is open; the
// answer shows with no height animation, and the icon turns in .25s, with reduced motion too, as in the
// design. At 760px and below the answer gives up its wide right margin.
export function Faq() {
  return (
    <Section block="faq" id="perguntas" labelledBy="faq-title">
      <SectionHeader id="faq-title" title="Perguntas frequentes" count={QUESTIONS.length} />
      <Accordion.Root
        multiple
        defaultValue={[0]}
        render={<ul />}
        role="list"
        className="flex flex-col gap-3"
      >
        {QUESTIONS.map(({ question, answer }, index) => (
          <Accordion.Item
            key={question}
            value={index}
            render={<li />}
            className="rounded-16 bg-surface"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex min-h-18 w-full cursor-pointer items-center justify-between gap-4 rounded-16 border-0 bg-transparent py-3.5 pr-4 pl-6 text-left font-medium text-16 text-bright tracking-tight-10">
                <span>{question}</span>
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 grow-0 basis-10 place-items-center rounded-circle bg-night text-bright transition-transform duration-slow group-data-panel-open:rotate-45"
                >
                  <PlusIcon />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel
              render={<p />}
              className="pr-20 pb-6 pl-6 text-pretty text-16 text-muted leading-155 tracking-tight-10 narrow:pr-6"
            >
              {answer}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Section>
  );
}
