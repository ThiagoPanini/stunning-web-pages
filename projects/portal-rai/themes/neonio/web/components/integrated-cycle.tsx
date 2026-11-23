import { Fragment, type ReactNode } from "react";
import {
  AttackIcon,
  DevelopIcon,
  DiscoverIcon,
  MeasureIcon,
  ProtectIcon,
} from "./cycle-icons";
import { CycleTabs } from "./cycle-tabs";
import { Eyebrow } from "./eyebrow";
import { Lead } from "./lead";
import { MediaPlaceholder } from "./media-placeholder";
import { NeonSquare } from "./neon-square";
import { SectionTitle } from "./section-title";

type Step = {
  id: string;
  tab: string;
  icon: ReactNode;
  team: "red" | "blue";
  title: string;
  // The second line of the title, in grey.
  subtitle: string;
  text: string;
};

const TEAM_NAMES = { red: "Red Team", blue: "Blue Team" };

const STEPS: Step[] = [
  {
    id: "cycle-step-1",
    tab: "Atacar",
    icon: <AttackIcon />,
    team: "red",
    title: "Atacar os agentes",
    subtitle: "antes que alguém de fora ataque",
    text: "O Red Team cria agentes de ataque que simulam adversários reais em conversas com os agentes da companhia, turno a turno, até descobrir onde eles cedem.",
  },
  {
    id: "cycle-step-2",
    tab: "Descobrir",
    icon: <DiscoverIcon />,
    team: "red",
    title: "Encontrar onde o agente cede",
    subtitle: "e registrar tudo",
    text: "O agente de ataque adapta a estratégia a cada turno e registra tudo o que conseguiu. O que passou vira um achado novo, enviado ao Blue Team.",
  },
  {
    id: "cycle-step-3",
    tab: "Desenvolver",
    icon: <DevelopIcon />,
    team: "blue",
    title: "Transformar a falha em guardrail",
    subtitle: "testável, versionado e medido",
    text: "O Blue Team transforma cada falha conhecida em um guardrail testável, versionado e medido antes de chegar a qualquer cliente.",
  },
  {
    id: "cycle-step-4",
    tab: "Proteger",
    icon: <ProtectIcon />,
    team: "blue",
    title: "Proteger cada conversa",
    subtitle: "em produção e em tempo real",
    text: "Os guardrails de entrada avaliam a mensagem do cliente antes de ela chegar ao agente. Os de saída conferem a resposta antes de ela chegar ao cliente.",
  },
  {
    id: "cycle-step-5",
    tab: "Medir",
    icon: <MeasureIcon />,
    team: "blue",
    title: "Acompanhar o resultado",
    subtitle: "todos os dias",
    text: "Acionamentos, falsos positivos e latência de cada guardrail. A cada nova versão de agente, o ciclo recomeça com o Red Team.",
  },
];

const TABS = STEPS.map(({ id, tab, icon }) => ({ target: id, label: tab, icon }));

// A step of the cycle (.uk-step): the text beside a GIF placeholder, which goes below it at 900px and
// less. Its anchor stops below the header and the tab bar (below the bar alone at 760px and less).
function CycleStep({ step, index }: { step: Step; index: number }) {
  return (
    <div
      id={step.id}
      className="grid min-h-141.5 scroll-mt-29.5 grid-cols-2 border-rule border-b upto-760:scroll-mt-16 upto-900:grid-cols-1"
    >
      <div className="flex flex-col justify-center gap-5.5 px-panel-x py-panel-y">
        <span className="inline-flex items-center gap-2.5 font-mono-short font-normal text-12 text-muted uppercase leading-1000 tracking-wide-40">
          <NeonSquare team={step.team} size="small" />
          {TEAM_NAMES[step.team]} · etapa {index + 1} de {STEPS.length}
        </span>
        <h3 className="text-balance font-normal text-28 text-white leading-1140 tracking-tight-20">
          {step.title}
          <span className="block text-muted">{step.subtitle}</span>
        </h3>
        <Lead tone="secondary" className="max-w-110">
          {step.text}
        </Lead>
      </div>
      <MediaPlaceholder variant="step" label="inserir gif · 6:5" />
    </div>
  );
}

// The integrated cycle ("Ciclo integrado"): the eyebrow, the title and a lead beside it; then a sticky
// bar of five anchor tabs that follows the step in view, and the five steps, a hatched divider between
// two of them. Keep data-block="cycle" (the block's name in the origin's captures) and the id, the
// footer's anchor.
export function IntegratedCycle() {
  return (
    <section data-block="cycle" id="ciclo" aria-labelledby="cycle-title" className="pt-section">
      <div className="flex flex-wrap items-end justify-between gap-x-14 gap-y-6 px-inset pb-16">
        <div className="flex min-w-0 grow basis-140 flex-col gap-7">
          <Eyebrow>Ciclo integrado</Eyebrow>
          <SectionTitle id="cycle-title" className="max-w-215">
            Dois times, um ciclo. O Red Team procura a falha. O Blue Team fecha a falha.
          </SectionTitle>
        </div>
        <Lead className="basis-95">
          O que um descobre vira o backlog do outro, a cada nova versão de agente.
        </Lead>
      </div>

      <CycleTabs tabs={TABS} />

      {STEPS.map((step, index) => (
        <Fragment key={step.id}>
          {index > 0 && <div aria-hidden="true" className="h-12 border-rule border-b bg-hatch" />}
          <CycleStep step={step} index={index} />
        </Fragment>
      ))}
    </section>
  );
}
