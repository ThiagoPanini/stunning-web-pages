import type { ReactNode } from "react";
import { ApiCallCard } from "@/components/api-call-card";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/button-link";
import { EclusaCaption } from "@/components/eclusa-caption";
import { EclusaLogo } from "@/components/eclusa-logo";
import { FooterLink } from "@/components/footer-link";
import { InertLink } from "@/components/inert-link";
import { missionSteps } from "@/components/mission";
import { MissionColumn } from "@/components/mission-column";
import { NavLink } from "@/components/nav-link";
import { NavPill } from "@/components/nav-pill";
import { SectionLabel } from "@/components/section-label";
import { TeamBadge } from "@/components/team-badge";
import { TeamCard } from "@/components/team-card";
import {
  attackTurns,
  BlueTeamPanel,
  blueTeamCard,
  guardStages,
  RedTeamPanel,
  redTeamCard,
} from "@/components/teams";
import {
  TerminalLeaderRow,
  TerminalNote,
  TerminalPanel,
  TerminalStageRow,
} from "@/components/terminal-panel";
import { TextLink } from "@/components/text-link";

// Each component of the Home on its own, with the same files the Home is built with and, where the Home
// has it, the same text. A link or a button is shown at rest, then hovered and focused: inside
// data-show-state the theme draws that state with no pointer or keyboard on it (app/globals.css).
// Components with no state of their own show their variants.

type SpecimenProps = {
  name: string;
  file: string;
  about: ReactNode;
  children: ReactNode;
};

function Specimen({ name, file, about, children }: SpecimenProps) {
  return (
    <article data-component={name} className="flex flex-col gap-6 border-rule border-t pt-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="font-mono text-15 text-bright">{`<${name}>`}</h3>
          <code className="font-mono text-12 text-subtle">components/{file}</code>
        </div>
        <p className="max-w-160 text-pretty text-15 text-muted leading-160">{about}</p>
      </div>
      <div className="flex flex-wrap gap-4">{children}</div>
    </article>
  );
}

type StateProps = {
  // The caption, as interface text: "repouso" for the state at rest, otherwise the name of the state
  // or the variant. data-state carries it too, so a test finds a state by the caption it shows.
  label: string;
  // Draws the component hovered or focused.
  show?: "hover" | "focus";
  size?: "small" | "medium" | "large";
  children: ReactNode;
};

// Medium and large cells stop growing near the width the component has on the Home.
const cellSize = {
  small: "basis-50",
  medium: "basis-80 max-w-160",
  large: "basis-110 max-w-180",
};

function State({ label, show, size = "small", children }: StateProps) {
  return (
    <figure
      data-state={label}
      className={`flex min-w-0 grow flex-col gap-5 rounded-16 border border-rule p-6 ${cellSize[size]}`}
    >
      <figcaption className="font-mono text-12 text-subtle uppercase tracking-wide-80">
        {label}
      </figcaption>
      <div data-show-state={show} className="flex min-h-11 flex-wrap items-center gap-4">
        {children}
      </div>
    </figure>
  );
}

const Prop = ({ children }: { children: ReactNode }) => (
  <code className="font-mono text-13 text-bright">{children}</code>
);

export function ComponentSpecimens() {
  const [firstStep] = missionSteps;
  return (
    <div className="flex flex-col gap-14">
      <Specimen
        name="EclusaLogo"
        file="eclusa-logo.tsx"
        about={
          <>
            O logo do Hélio, em SVG, desenhado quadro a quadro. <Prop>animated</Prop> desligado
            deixa o logo parado no quadro de partida, como o movimento reduzido. <Prop>frame</Prop>{" "}
            escolhe o quadro de partida e <Prop>background</Prop> a cor do quadrado de fundo.
          </>
        }
      >
        <State label="animado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <EclusaLogo />
          </div>
        </State>
        <State label="parado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <EclusaLogo animated={false} />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="EclusaCaption"
        file="eclusa-caption.tsx"
        about="A legenda do logo: o que cada marca do desenho representa, numa linha só."
      >
        <State label="padrão" size="medium">
          <EclusaCaption />
        </State>
      </Specimen>

      <Specimen
        name="BrandMark"
        file="brand-mark.tsx"
        about={
          <>
            A marca ao lado de “Responsible AI”: um anel com um ponto. <Prop>variant</Prop> header
            ou footer.
          </>
        }
      >
        <State label="cabeçalho">
          <BrandMark />
        </State>
        <State label="rodapé">
          <BrandMark variant="footer" />
        </State>
      </Specimen>

      <Specimen
        name="ButtonLink"
        file="button-link.tsx"
        about={
          <>
            O botão claro. Sobe 1 px e brilha em hover. <Prop>variant</Prop> page ou header, mais
            estreito e sem quebra. Sem <Prop>href</Prop> é Lacuna e fica inerte, como todos os
            botões da Home.
          </>
        }
      >
        <State label="repouso">
          <ButtonLink>Testar um guardrail</ButtonLink>
        </State>
        <State label="hover" show="hover">
          <ButtonLink>Testar um guardrail</ButtonLink>
        </State>
        <State label="foco" show="focus">
          <ButtonLink>Testar um guardrail</ButtonLink>
        </State>
        <State label="cabeçalho">
          <ButtonLink variant="header">Testar um guardrail</ButtonLink>
        </State>
      </Specimen>

      <Specimen
        name="TextLink"
        file="text-link.tsx"
        about={
          <>
            O link discreto ao lado de um botão, que acende em hover. Sem <Prop>href</Prop> é Lacuna
            e fica inerte.
          </>
        }
      >
        <State label="repouso">
          <TextLink>Ver os dados →</TextLink>
        </State>
        <State label="hover" show="hover">
          <TextLink>Ver os dados →</TextLink>
        </State>
        <State label="foco" show="focus">
          <TextLink>Ver os dados →</TextLink>
        </State>
      </Specimen>

      <Specimen
        name="NavPill"
        file="nav-pill.tsx"
        about={
          <>
            A pílula da navegação do cabeçalho, com os links dentro, da largura deles.{" "}
            <Prop>label</Prop> dá nome à navegação.
          </>
        }
      >
        <State label="na Home" size="medium">
          {/* Narrow, the header lets the pill scroll sideways; so does this cell. */}
          <div className="max-w-full overflow-x-auto">
            <NavPill label="Exemplo de navegação">
              <NavLink href="/" current>
                Home
              </NavLink>
              <NavLink>Dados</NavLink>
              <NavLink>Playground</NavLink>
              <NavLink>Integrações</NavLink>
            </NavPill>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="NavLink"
        file="nav-link.tsx"
        about={
          <>
            Um link da pílula: apagado, acende sobre um fundo leve em hover. <Prop>current</Prop>{" "}
            marca a página aberta e não muda em hover. Sem <Prop>href</Prop> é Lacuna e fica inerte.
            Em ponteiro grosso cresce para 44 px.
          </>
        }
      >
        <State label="repouso">
          <NavLink>Dados</NavLink>
        </State>
        <State label="hover" show="hover">
          <NavLink>Dados</NavLink>
        </State>
        <State label="foco" show="focus">
          <NavLink>Dados</NavLink>
        </State>
        <State label="atual">
          <NavLink href="/" current>
            Home
          </NavLink>
        </State>
      </Specimen>

      <Specimen
        name="FooterLink"
        file="footer-link.tsx"
        about={
          <>
            Um link do rodapé, que acende em hover, com alvo de 44 px. <Prop>current</Prop> marca a
            página aberta. Sem <Prop>href</Prop> é Lacuna e fica inerte.
          </>
        }
      >
        <State label="repouso">
          <FooterLink>Dados</FooterLink>
        </State>
        <State label="hover" show="hover">
          <FooterLink>Dados</FooterLink>
        </State>
        <State label="foco" show="focus">
          <FooterLink>Dados</FooterLink>
        </State>
        <State label="atual">
          <FooterLink href="/" current>
            Home
          </FooterLink>
        </State>
      </Specimen>

      <Specimen
        name="InertLink"
        file="inert-link.tsx"
        about={
          <>
            A base dos links sem destino, as Lacunas: parece e recebe foco como link, diz que está
            indisponível e não navega. Não tem estilo próprio; quem o usa dá a classe.
          </>
        }
      >
        <State label="repouso">
          <InertLink>Integrações</InertLink>
        </State>
        <State label="foco" show="focus">
          <InertLink>Integrações</InertLink>
        </State>
      </Specimen>

      <Specimen
        name="SectionLabel"
        file="section-label.tsx"
        about={
          <>
            O rótulo mono em caixa alta que abre a abertura e cada seção numerada, no formato “01 ·
            Missão”. <Prop>className</Prop> recebe o movimento de entrada.
          </>
        }
      >
        <State label="seção" size="medium">
          <SectionLabel>01 · Missão</SectionLabel>
        </State>
        <State label="abertura" size="medium">
          <SectionLabel>Guardrails para agentes conversacionais de IA</SectionLabel>
        </State>
      </Specimen>

      <Specimen
        name="MissionColumn"
        file="mission-column.tsx"
        about={
          <>
            Uma coluna da Missão: o nome do passo sobre o que o time faz nele, sob um filete forte.{" "}
            <Prop>title</Prop> é o passo, <Prop>children</Prop> o texto; <Prop>className</Prop>{" "}
            recebe a subida escalonada.
          </>
        }
      >
        <State label="padrão" size="medium">
          <MissionColumn title={firstStep.title}>{firstStep.body}</MissionColumn>
        </State>
      </Specimen>

      <Specimen
        name="TeamBadge"
        file="team-badge.tsx"
        about={
          <>
            O selo do time de uma solução. <Prop>team</Prop> red ou blue.
          </>
        }
      >
        <State label="red">
          <TeamBadge team="red" />
        </State>
        <State label="blue">
          <TeamBadge team="blue" />
        </State>
      </Specimen>

      <Specimen
        name="TeamCard"
        file="team-card.tsx"
        about={
          <>
            O cartão de um time: marca e nome, onde atua, título, parágrafo e o que fecha o cartão,
            na Home um painel de terminal. <Prop>team</Prop> red ou blue; <Prop>className</Prop>{" "}
            recebe o movimento de entrada.
          </>
        }
      >
        <State label="red" size="large">
          <TeamCard {...redTeamCard}>
            <RedTeamPanel />
          </TeamCard>
        </State>
        <State label="blue" size="large">
          <TeamCard {...blueTeamCard}>
            <BlueTeamPanel />
          </TeamCard>
        </State>
      </Specimen>

      <Specimen
        name="TerminalPanel"
        file="terminal-panel.tsx"
        about="O painel em estilo de terminal que fecha os cartões dos times: linhas em mono sobre a cor da página. Os dois da Home, como estão nos cartões."
      >
        <State label="Red Team" size="medium">
          <div className="w-full">
            <RedTeamPanel />
          </div>
        </State>
        <State label="Blue Team" size="medium">
          <div className="w-full">
            <BlueTeamPanel />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="TerminalNote"
        file="terminal-panel.tsx"
        about="Uma linha solta do painel, apagada: um comando, um fluxo, uma nota de fechamento."
      >
        <State label="padrão" size="medium">
          <div className="w-full">
            <TerminalPanel>
              <TerminalNote>1 achado novo enviado ao Blue Team</TerminalNote>
            </TerminalPanel>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="TerminalLeaderRow"
        file="terminal-panel.tsx"
        about={
          <>
            Um passo e o resultado ligados por um pontilhado. <Prop>tone</Prop> pinta o resultado de
            red, blue ou subtle; sem ele, o resultado fica na cor do painel. Na Home: sem tom, blue
            e red.
          </>
        }
      >
        <State label="tons" size="medium">
          <div className="w-full">
            <TerminalPanel>
              {attackTurns.map((turn) => (
                <TerminalLeaderRow
                  key={turn.label}
                  step={turn.label}
                  outcome={turn.detail}
                  tone={turn.tone}
                />
              ))}
            </TerminalPanel>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="TerminalStageRow"
        file="terminal-panel.tsx"
        about={
          <>
            Uma etapa numa coluna fixa e o que acontece nela. <Prop>tone</Prop> pinta a etapa de
            red, blue ou subtle; sem ele, a etapa fica na cor do painel. Na Home: blue e subtle.
          </>
        }
      >
        <State label="tons" size="medium">
          <div className="w-full">
            <TerminalPanel>
              {guardStages.map((stage) => (
                <TerminalStageRow key={stage.label} stage={stage.label} tone={stage.tone}>
                  {stage.detail}
                </TerminalStageRow>
              ))}
            </TerminalPanel>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="ApiCallCard"
        file="api-call-card.tsx"
        about="O cartão em mono que simula uma chamada à API de guardrails: a linha da requisição e um campo por linha. Em largura estreita, um valor longo desce para baixo do rótulo."
      >
        <State label="padrão" size="large">
          <div className="w-full">
            <ApiCallCard />
          </div>
        </State>
      </Specimen>
    </div>
  );
}
