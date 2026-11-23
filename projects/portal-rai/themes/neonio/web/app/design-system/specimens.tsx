import type { ReactNode } from "react";
import { OndasLogo } from "@/components/ondas-logo";

// Each component of the Home on its own, with the same files the Home is built with and, where the Home
// has it, the same text. A link, a button or a tab is shown at rest, then hovered and focused: inside
// data-show-state the theme draws that state with no pointer or keyboard on it (app/globals.css).
// Components with no state of their own show their variants.

type SpecimenProps = {
  // The component's name, or none when each cell names its own (a file with several drawings).
  name?: string;
  title: string;
  file: string;
  about: ReactNode;
  children: ReactNode;
};

function Specimen({ name, title, file, about, children }: SpecimenProps) {
  return (
    <article data-component={name} className="flex flex-col gap-6 border-rule border-t pt-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="font-mono-short text-15 text-white">{title}</h3>
          <code className="font-mono-short text-12 text-subtle">components/{file}</code>
        </div>
        <div className="max-w-160 text-pretty text-15 text-muted leading-1400">{about}</div>
      </div>
      <div className="flex flex-wrap gap-4">{children}</div>
    </article>
  );
}

type StateProps = {
  // The state, as interface text: "repouso" at rest, "hover" and "foco" drawn with no pointer or
  // keyboard on it, otherwise the name of the state or of the variant. data-state carries it, so a test
  // finds a state by the caption it shows.
  state: string;
  // The variant the state belongs to, when the component has several with states of their own; the
  // caption reads "branco · hover". data-variant carries it.
  variant?: string;
  // The component this cell shows, when the specimen's file has several (data-component).
  component?: string;
  size?: "small" | "medium" | "large" | "full";
  children: ReactNode;
};

// Medium and large cells stop growing near the width the component has on the Home; a full cell takes
// the whole row.
const cellSize = {
  small: "basis-50",
  medium: "basis-80 max-w-160",
  large: "basis-110 max-w-180",
  full: "basis-full",
};

const shownState: Record<string, "hover" | "focus" | undefined> = { hover: "hover", foco: "focus" };

function State({ state, variant, component, size = "small", children }: StateProps) {
  return (
    <figure
      data-state={state}
      data-variant={variant}
      data-component={component}
      className={`flex min-w-0 grow flex-col gap-5 border border-rule p-6 ${cellSize[size]}`}
    >
      <figcaption className="font-mono-short text-12 text-subtle uppercase leading-1000 tracking-wide-40">
        {variant ? `${variant} · ${state}` : state}
      </figcaption>
      <div
        data-show-state={shownState[state]}
        className="flex min-h-11 flex-wrap items-center gap-4"
      >
        {children}
      </div>
    </figure>
  );
}

const Prop = ({ children }: { children: ReactNode }) => (
  <code className="font-mono-short text-13 text-white">{children}</code>
);

export function ComponentSpecimens() {
  return (
    <div className="flex flex-col gap-14">
      <Specimen
        name="OndasLogo"
        title="<OndasLogo>"
        file="ondas-logo.tsx"
        about={
          <>
            O logo em caracteres, desenhado quadro a quadro: o agente no centro, o anel de
            guardrails e as ondas de ataque e de resposta. <Prop>animated</Prop> desligado deixa o
            logo parado no quadro de partida, como o movimento reduzido; <Prop>frame</Prop> escolhe
            o quadro de partida e <Prop>background</Prop> o fundo, que na Home é a cor da página. No
            alto desta página, o logo aparece como o Quadro dele o desenha sozinho: 560 px, no fundo
            do próprio Quadro.
          </>
        }
      >
        <State state="animado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo />
          </div>
        </State>
        <State state="parado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo animated={false} />
          </div>
        </State>
      </Specimen>
    </div>
  );
}
