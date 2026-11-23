import type { ReactNode } from "react";
import { AnswerLink, FaqAccordion, FaqItem } from "./faq-accordion";
import { Section } from "./section";
import { SectionHeader } from "./section-header";

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

// Perguntas frequentes (6): the accordion of the six questions, the first one open on arrival (rf-faq).
export function Faq() {
  return (
    <Section block="faq" id="perguntas" labelledBy="faq-title">
      <SectionHeader id="faq-title" title="Perguntas frequentes" count={QUESTIONS.length} />
      <FaqAccordion defaultOpen={[0]}>
        {QUESTIONS.map(({ question, answer }, index) => (
          <FaqItem key={question} index={index} question={question}>
            {answer}
          </FaqItem>
        ))}
      </FaqAccordion>
    </Section>
  );
}
