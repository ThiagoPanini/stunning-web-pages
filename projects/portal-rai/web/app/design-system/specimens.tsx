import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink } from "@/components/button-link";
import { CycleRail } from "@/components/cycle-rail";
import { StepIcon } from "@/components/cycle-steps";
import { FooterLink } from "@/components/footer-link";
import { GifSpace } from "@/components/gif-space";
import { InertLink } from "@/components/inert-link";
import { NavLink } from "@/components/nav-link";
import { NavPill } from "@/components/nav-pill";
import { OndasCaption } from "@/components/ondas-caption";
import { OndasLogo } from "@/components/ondas-logo";
import { OndasMini } from "@/components/ondas-mini";
import { SectionHeader } from "@/components/section-header";
import { SectionLabel } from "@/components/section-label";
import { TeamCardsMiddle } from "@/components/team-cards-middle";
import { TeamCardsSimple } from "@/components/team-cards-simple";
import { TeamCardsSurprise } from "@/components/team-cards-surprise";
import { TeamIcon } from "@/components/team-icon";
import { TextLink } from "@/components/text-link";
import { CycleSpecimen } from "./cycle-specimen";

// Each component of the Home on its own, with the same files the Home is built with and, where the Home
// has it, the same text. A link or a button is shown at rest, then hovered and focused: inside
// data-show-state the stylesheet draws that state with no pointer or keyboard on it (app/globals.css).
// Components with no state of their own show their variants. The versions of the board's tweaks are
// components too: each version of the cycle and of the team cards shows here, the neon in its three
// forms, hovered.

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
  size?: "small" | "medium" | "large" | "full";
  children: ReactNode;
};

// Medium and large cells stop growing near the width the component has on the Home; the versions of the
// cycle and of the cards take the whole row, as on the Home.
const cellSize = {
  small: "basis-50",
  medium: "basis-80 max-w-160",
  large: "basis-110 max-w-180",
  full: "basis-full",
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
      <div
        data-show-state={show}
        className={
          size === "full" ? "flex min-h-11 flex-col" : "flex min-h-11 flex-wrap items-center gap-4"
        }
      >
        {children}
      </div>
    </figure>
  );
}

const Prop = ({ children }: { children: ReactNode }) => (
  <code className="font-mono text-13 text-bright">{children}</code>
);

const NEON_STATES = [
  { effect: "preenchimento", about: "hover · preenchimento" },
  { effect: "contorno", about: "hover · contorno" },
  { effect: "holofote", about: "hover · holofote" },
] as const;

export function ComponentSpecimens() {
  return (
    <div className="flex flex-col gap-14">
      <Specimen
        name="OndasLogo"
        file="ondas-logo.tsx"
        about={
          <>
            O logo Ondas do hero, em caracteres, desenhado quadro a quadro: uma grade de 64 por 32
            em quatro camadas, o agente, os guardrails, o que é barrado e o que passa.{" "}
            <Prop>animated</Prop> desligado deixa o logo parado no quadro de partida, como o
            movimento reduzido. <Prop>frame</Prop> escolhe o quadro de partida e{" "}
            <Prop>background</Prop> a cor de fundo; na Home, a noite da página.
          </>
        }
      >
        <State label="animado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo background="var(--color-night)" />
          </div>
        </State>
        <State label="parado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo background="var(--color-night)" animated={false} />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="OndasCaption"
        file="ondas-caption.tsx"
        about="A legenda do logo: o caractere de cada parte do desenho e o que ele representa, numa linha só."
      >
        <State label="padrão" size="medium">
          <OndasCaption />
        </State>
      </Specimen>

      <Specimen
        name="OndasMini"
        file="ondas-mini.tsx"
        about={
          <>
            O Ondas em tamanho de marca, no cabeçalho: a mesma cena do logo, com o agente em linhas
            e tudo o que viaja como ponto, porque caracteres somem em 38 px. Mesmas props do logo;
            no cabeçalho o fundo é <Prop>transparent</Prop>.
          </>
        }
      >
        <State label="cabeçalho">
          <div className="size-9.5">
            <OndasMini background="transparent" />
          </div>
        </State>
        <State label="160 px">
          <div data-region="mini-160" className="size-40">
            <OndasMini animated={false} />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="BrandMark"
        file="brand-mark.tsx"
        about="A marca do rodapé ao lado de “Responsible AI”: um anel com um ponto, em muted."
      >
        <State label="rodapé">
          <BrandMark variant="footer" />
        </State>
      </Specimen>

      <Specimen
        name="NavPill"
        file="nav-pill.tsx"
        about={
          <>
            A pílula que segura os links da navegação, tão larga quanto eles. <Prop>label</Prop> dá
            o nome da navegação.
          </>
        }
      >
        <State label="na Home" size="medium">
          <NavPill label="Exemplo">
            <NavLink href="/" current>
              Home
            </NavLink>
            <NavLink href="#solucoes">Soluções</NavLink>
            <NavLink>Dados</NavLink>
            <NavLink>Integrações</NavLink>
          </NavPill>
        </State>
      </Specimen>

      <Specimen
        name="NavLink"
        file="nav-link.tsx"
        about={
          <>
            Um link da navegação: muted, aceso num fundo leve em hover; num ponteiro grosso, 44 px.{" "}
            <Prop>current</Prop> marca a página atual. Sem <Prop>href</Prop>, fica inerte.
          </>
        }
      >
        <State label="repouso">
          <NavLink href="#solucoes">Soluções</NavLink>
        </State>
        <State label="hover" show="hover">
          <NavLink href="#solucoes">Soluções</NavLink>
        </State>
        <State label="foco" show="focus">
          <NavLink href="#solucoes">Soluções</NavLink>
        </State>
        <State label="atual">
          <NavLink href="/" current>
            Home
          </NavLink>
        </State>
      </Specimen>

      <Specimen
        name="ButtonLink"
        file="button-link.tsx"
        about={
          <>
            O botão claro: sobe 1 px e brilha em hover. <Prop>variant</Prop> header é o do
            cabeçalho, mais estreito e sem quebra.
          </>
        }
      >
        <State label="repouso">
          <ButtonLink href="#times">Conhecer os times</ButtonLink>
        </State>
        <State label="hover" show="hover">
          <ButtonLink href="#times">Conhecer os times</ButtonLink>
        </State>
        <State label="foco" show="focus">
          <ButtonLink href="#times">Conhecer os times</ButtonLink>
        </State>
        <State label="cabeçalho">
          <ButtonLink href="#comece" variant="header">
            Simular um ataque
          </ButtonLink>
        </State>
      </Specimen>

      <Specimen
        name="TextLink"
        file="text-link.tsx"
        about="O link discreto ao lado do botão: muted, claro em hover."
      >
        <State label="repouso">
          <TextLink href="#solucoes">Produtos e soluções</TextLink>
        </State>
        <State label="hover" show="hover">
          <TextLink href="#solucoes">Produtos e soluções</TextLink>
        </State>
        <State label="foco" show="focus">
          <TextLink href="#solucoes">Produtos e soluções</TextLink>
        </State>
      </Specimen>

      <Specimen
        name="FooterLink"
        file="footer-link.tsx"
        about={
          <>
            Um link do rodapé: subtle, claro em hover, com alvo de 44 px. <Prop>current</Prop> marca
            a página atual.
          </>
        }
      >
        <State label="repouso">
          <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
        </State>
        <State label="hover" show="hover">
          <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
        </State>
        <State label="foco" show="focus">
          <FooterLink href="#topo">Voltar ao topo ↑</FooterLink>
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
        about="Um link cujo destino o design deixou em aberto: parece e recebe foco como link, diz que está indisponível e não leva a lugar nenhum."
      >
        <State label="repouso">
          <InertLink className="text-14 text-muted">Dados</InertLink>
        </State>
        <State label="foco" show="focus">
          <InertLink className="text-14 text-muted">Dados</InertLink>
        </State>
      </Specimen>

      <Specimen
        name="SectionLabel"
        file="section-label.tsx"
        about="O rótulo mono em caixa alta que abre o hero e cada seção numerada."
      >
        <State label="seção" size="medium">
          <SectionLabel>01 · Modelo de trabalho</SectionLabel>
        </State>
      </Specimen>

      <Specimen
        name="SectionHeader"
        file="section-header.tsx"
        about="A abertura de uma seção numerada: o rótulo, o título e o parágrafo de abertura."
      >
        <State label="seção" size="large">
          <SectionHeader
            label="02 · Times"
            titleId="exemplo-times"
            title="Dois times, um propósito"
            lead="O Red Team procura a falha e o Blue Team corrige: o que um descobre vira backlog do outro."
          />
        </State>
      </Specimen>

      <Specimen
        name="StepIcon"
        file="cycle-steps.tsx"
        about={
          <>
            O ícone de cada etapa do ciclo, um traço na cor atual: lupa, colchetes de código, balão
            com check e linha de pulso. Quando a etapa entra em foco, ele faz o seu gesto.{" "}
            <Prop>size</Prop> é 22 ou 32 px.
          </>
        }
      >
        {["Pesquisar", "Desenvolver", "Implementar", "Monitorar"].map((name, step) => (
          <State key={name} label={name.toLowerCase()}>
            <span className="text-bright">
              <StepIcon step={step} size={32} />
            </span>
          </State>
        ))}
      </Specimen>

      <Specimen
        name="CycleLoop"
        file="cycle-loop.tsx"
        about="Versão 06 do ciclo, o laço: um traço só, em forma de infinito, com o trabalho antes da produção à esquerda e o que acontece em produção à direita. Uma estação por etapa, as entregas em etiquetas com o ponto da cor delas e a seta do sentido, e as etapas em lista dos dois lados. Segurada, a etapa acende o lóbulo dela e as duas entregas."
      >
        <State label="repouso" size="full">
          <CycleSpecimen version="CycleLoop" />
        </State>
        <State label="segurada" size="full">
          <CycleSpecimen version="CycleLoop" held={2} />
        </State>
      </Specimen>

      <Specimen
        name="CycleRail"
        file="cycle-rail.tsx"
        about="O trilho pontilhado em volta dos cartões, que fecha o ciclo por baixo: uma trilha quieta e os pontos que correm por ela."
      >
        <State label="padrão" size="medium">
          <div className="relative h-24 w-full">
            <CycleRail className="inset-0 size-full" radius={16} />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="CycleCards"
        file="cycle-cards.tsx"
        about="Versão 03 do ciclo, os cartões: quatro cartões em fila e o trilho pontilhado por baixo, com as setas do sentido; as entregas em etiquetas com o ponto da cor delas, sobre as emendas. O cartão em destaque clareia, acende a borda e mostra o texto grande; com o ciclo andando sozinho, uma luz corre a borda de cima dele. Segurada, a etapa acende as duas entregas."
      >
        <State label="repouso" size="full">
          <CycleSpecimen version="CycleCards" />
        </State>
        <State label="segurada" size="full">
          <CycleSpecimen version="CycleCards" held={2} />
        </State>
      </Specimen>

      <Specimen
        name="GifSpace"
        file="gif-space.tsx"
        about={
          <>
            O espaço reservado de um GIF, 16:9, tracejado e listrado, com o que vai ali escrito no
            meio. <Prop>label</Prop> é o que o leitor de tela diz; <Prop>lines</Prop>, as duas
            linhas do meio.
          </>
        }
      >
        <State label="padrão" size="medium">
          <GifSpace
            label="Espaço reservado para o GIF do Red Team, proporção 16:9"
            lines={["Inserir GIF · Red Team", "16:9 · 1280 × 720"]}
          />
        </State>
      </Specimen>

      <Specimen
        name="TeamIcon"
        file="team-icon.tsx"
        about={
          <>
            O ícone de cada time: a espada do Red Team e o escudo do Blue Team. <Prop>variant</Prop>{" "}
            simple é o do disco da Versão 01, de 22 px e traço mais grosso.
          </>
        }
      >
        <State label="red · card">
          <span className="text-bright">
            <TeamIcon team="red" variant="card" />
          </span>
        </State>
        <State label="blue · card">
          <span className="text-bright">
            <TeamIcon team="blue" variant="card" />
          </span>
        </State>
        <State label="red · simple">
          <span className="text-red">
            <TeamIcon team="red" variant="simple" />
          </span>
        </State>
        <State label="blue · simple">
          <span className="text-blue">
            <TeamIcon team="blue" variant="simple" />
          </span>
        </State>
      </Specimen>

      <Specimen
        name="TeamCardsSimple"
        file="team-cards-simple.tsx"
        about="Versão 01 dos cards dos times, a simple: moldura fina que escurece em hover, número, ícone em disco e o texto na base."
      >
        <State label="repouso" size="full">
          <TeamCardsSimple />
        </State>
        <State label="hover" show="hover" size="full">
          <TeamCardsSimple />
        </State>
      </Specimen>

      <Specimen
        name="TeamCardsSurprise"
        file="team-cards-surprise.tsx"
        about={
          <>
            Versão 02 dos cards dos times, a surprise: em hover o texto grande toma o lugar do
            pequeno e o neon vem na forma que <Prop>neon</Prop> escolhe (o tweak efeitoNeon):
            preenchimento, contorno ou holofote. Os dois cards aparecem em hover juntos aqui; na
            Home, um de cada vez.
          </>
        }
      >
        <State label="repouso" size="full">
          <TeamCardsSurprise neon="preenchimento" />
        </State>
        {NEON_STATES.map(({ effect, about }) => (
          <State key={effect} label={about} show="hover" size="full">
            <TeamCardsSurprise neon={effect} />
          </State>
        ))}
      </Specimen>

      <Specimen
        name="TeamCardsMiddle"
        file="team-cards-middle.tsx"
        about="Versão 03 dos cards dos times, a middle: a Versão 02 em repouso, sem hover, com o espaço de um GIF no miolo."
      >
        <State label="padrão" size="full">
          <TeamCardsMiddle />
        </State>
      </Specimen>
    </div>
  );
}
