import { Accordion } from "@base-ui/react/accordion";
import type { ReactNode } from "react";
import { InertLink } from "./inert-link";

// The accordion of the questions (rf-faq), from Base UI: questions that open and close each on its own.
// Each question is a heading with a button that says whether it is open; the answer shows with no height
// animation, and the icon turns in .25s, with reduced motion too, as in the design. At 760px and below the
// answer gives up its wide right margin.

type FaqAccordionProps = {
  // The questions, as FaqItem.
  children: ReactNode;
  // The indexes of the questions open on arrival; the Home opens the first.
  defaultOpen?: number[];
};

// The list of questions.
export function FaqAccordion({ children, defaultOpen }: FaqAccordionProps) {
  return (
    <Accordion.Root
      multiple
      defaultValue={defaultOpen}
      render={<ul />}
      role="list"
      className="flex flex-col gap-3"
    >
      {children}
    </Accordion.Root>
  );
}

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

type FaqItemProps = {
  // Its place in the list, by which FaqAccordion's defaultOpen names it.
  index: number;
  question: string;
  // The answer.
  children: ReactNode;
};

// A question of the accordion and its answer, closed or open. It goes in a FaqAccordion.
export function FaqItem({ index, question, children }: FaqItemProps) {
  return (
    <Accordion.Item value={index} render={<li />} className="rounded-16 bg-surface">
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
        {children}
      </Accordion.Panel>
    </Accordion.Item>
  );
}

// A link inside an answer, to a screen the design left open (rf-faq-a a): a design gap, inert.
export function AnswerLink({ children }: { children: ReactNode }) {
  return <InertLink className="text-cream underline underline-offset-3">{children}</InertLink>;
}
