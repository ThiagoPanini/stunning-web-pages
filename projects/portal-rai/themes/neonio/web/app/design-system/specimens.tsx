import type { ReactNode } from "react";
import { AntiAttackGuardrailIllustration } from "@/components/anti-attack-guardrail-illustration";
import { AttackAgentIllustration } from "@/components/attack-agent-illustration";
import { Brands } from "@/components/brands";
import { ButtonLink } from "@/components/button-link";
import { Caption } from "@/components/caption";
import {
  AttackIcon,
  DevelopIcon,
  DiscoverIcon,
  MeasureIcon,
  ProtectIcon,
} from "@/components/cycle-icons";
import { CycleTab } from "@/components/cycle-tab";
import { type CycleTabItem, CycleTabs } from "@/components/cycle-tabs";
import { DataChartIllustration } from "@/components/data-chart-illustration";
import { Eyebrow } from "@/components/eyebrow";
import { FooterLink } from "@/components/footer-link";
import { HeaderBlockLink } from "@/components/header-block-link";
import { IllustrationFrame } from "@/components/illustration-frame";
import { InertLink } from "@/components/inert-link";
import { Lead } from "@/components/lead";
import { MediaPlaceholder, PlaceholderMark } from "@/components/media-placeholder";
import { NavLink } from "@/components/nav-link";
import { NeonSquare } from "@/components/neon-square";
import { OndasCaption } from "@/components/ondas-caption";
import { OndasLogo } from "@/components/ondas-logo";
import { OutputEthicsGuardrailIllustration } from "@/components/output-ethics-guardrail-illustration";
import { RedWeekIllustration } from "@/components/red-week-illustration";
import { SectionTitle } from "@/components/section-title";

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
        className="flex min-h-11 min-w-0 flex-wrap items-center gap-4"
      >
        {children}
      </div>
    </figure>
  );
}

// The three cells of a link, a button or a tab: at rest, hovered and focused.
function Interactive({ variant, children }: { variant?: string; children: ReactNode }) {
  return (
    <>
      <State state="repouso" variant={variant}>
        {children}
      </State>
      <State state="hover" variant={variant}>
        {children}
      </State>
      <State state="foco" variant={variant}>
        {children}
      </State>
    </>
  );
}

const Prop = ({ children }: { children: ReactNode }) => (
  <code className="font-mono-short text-13 text-white">{children}</code>
);

// The Home's five tabs, as the cycle's bar lists them; here no step of the page is their target.
const CYCLE_TABS: CycleTabItem[] = [
  { target: "cycle-step-1", label: "Atacar", icon: <AttackIcon /> },
  { target: "cycle-step-2", label: "Descobrir", icon: <DiscoverIcon /> },
  { target: "cycle-step-3", label: "Desenvolver", icon: <DevelopIcon /> },
  { target: "cycle-step-4", label: "Proteger", icon: <ProtectIcon /> },
  { target: "cycle-step-5", label: "Medir", icon: <MeasureIcon /> },
];

const CYCLE_ICONS: [string, string, ReactNode][] = [
  ["AttackIcon", "Atacar", <AttackIcon key="attack" />],
  ["DiscoverIcon", "Descobrir", <DiscoverIcon key="discover" />],
  ["DevelopIcon", "Desenvolver", <DevelopIcon key="develop" />],
  ["ProtectIcon", "Proteger", <ProtectIcon key="protect" />],
  ["MeasureIcon", "Medir", <MeasureIcon key="measure" />],
];

const ILLUSTRATIONS: [string, string, ReactNode][] = [
  ["AttackAgentIllustration", "Agente de Ataque", <AttackAgentIllustration key="attack" />],
  ["RedWeekIllustration", "Semana Vermelha", <RedWeekIllustration key="week" />],
  [
    "AntiAttackGuardrailIllustration",
    "Guardrail Antiataque",
    <AntiAttackGuardrailIllustration key="anti-attack" />,
  ],
  [
    "OutputEthicsGuardrailIllustration",
    "Guardrail Ética Saída",
    <OutputEthicsGuardrailIllustration key="output-ethics" />,
  ],
];

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

      <Specimen
        name="OndasCaption"
        title="<OndasCaption>"
        file="ondas-caption.tsx"
        about="A legenda sob o logo: o caractere de cada camada do desenho, na cor dela, e o que ela representa. Centrada, numa linha enquanto couber."
      >
        <State state="padrão" size="medium">
          <div className="w-full">
            <OndasCaption />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="HeaderBlockLink"
        title="<HeaderBlockLink>"
        file="header-block-link.tsx"
        about={
          <>
            Um dos blocos brancos do fim do cabeçalho, “Contato” e “Testar um guardrail”: um cinza
            mais escuro em hover. Sem <Prop>href</Prop> é Lacuna e fica inerte.
          </>
        }
      >
        <Interactive>
          <HeaderBlockLink>Testar um guardrail</HeaderBlockLink>
        </Interactive>
      </Specimen>

      <Specimen
        name="NavLink"
        title="<NavLink>"
        file="nav-link.tsx"
        about="Um link da navegação, no primeiro bloco branco do cabeçalho: texto escuro, um fundo cinza-claro em hover e o anel de foco escuro, por dentro. As Telas dele ainda não existem, então fica inerte."
      >
        <Interactive>
          <div className="flex bg-white font-medium text-14">
            <NavLink>Dados</NavLink>
          </div>
        </Interactive>
      </Specimen>

      <Specimen
        name="InertLink"
        title="<InertLink>"
        file="inert-link.tsx"
        about="A base dos links sem destino, as Lacunas: parece e recebe foco como link, diz que está indisponível e não navega. Não tem estilo próprio; quem o usa dá a classe."
      >
        <State state="repouso">
          <InertLink>Integrações</InertLink>
        </State>
        <State state="foco">
          <InertLink>Integrações</InertLink>
        </State>
      </Specimen>

      <Specimen
        name="ButtonLink"
        title="<ButtonLink>"
        file="button-link.tsx"
        about={
          <>
            O botão quadrado da Home, na abertura, em Dados e na chamada final. <Prop>variant</Prop>{" "}
            white, cheio de branco e cinza em hover, ou outline, com a borda branca e um branco leve
            em hover. Sem <Prop>href</Prop> é Lacuna e fica inerte, como todos os botões da Home.
          </>
        }
      >
        <Interactive variant="white">
          <ButtonLink variant="white">Testar um guardrail</ButtonLink>
        </Interactive>
        <Interactive variant="outline">
          <ButtonLink variant="outline">Ver os dados</ButtonLink>
        </Interactive>
      </Specimen>

      <Specimen
        name="Lead"
        title="<Lead>"
        file="lead.tsx"
        about={
          <>
            O parágrafo sob um título, na abertura e em cada seção. <Prop>tone</Prop> muted, o
            padrão, ou secondary, mais claro, nas etapas do ciclo e na chamada final;{" "}
            <Prop>className</Prop> dá a largura máxima de cada uso.
          </>
        }
      >
        <State state="muted" size="medium">
          <Lead className="max-w-130">
            Quatro frentes, duas de cada time, que os times de produto podem acionar para os seus
            agentes conversacionais.
          </Lead>
        </State>
        <State state="secondary" size="medium">
          <Lead tone="secondary" className="max-w-110">
            O Red Team cria agentes de ataque que simulam adversários reais em conversas com os
            agentes da companhia, turno a turno, até descobrir onde eles cedem.
          </Lead>
        </State>
      </Specimen>

      <Specimen
        name="Brands"
        title="<Brands>"
        file="brands.tsx"
        about="A faixa de marcas, de borda a borda sob a abertura: as oito marcas de exemplo rolam sem parar, com as pontas esmaecidas, e param enquanto o ponteiro está sobre a faixa. Com movimento reduzido, fica parada no começo. É um bloco da Home, aqui pelos estados."
      >
        <State state="rolando" size="full">
          <div className="w-full min-w-0">
            <Brands />
          </div>
        </State>
        <State state="hover" size="full">
          <div className="w-full min-w-0">
            <Brands />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="SectionTitle"
        title="<SectionTitle>"
        file="section-title.tsx"
        about={
          <>
            O título leve de uma seção, equilibrado nas linhas. <Prop>size</Prop> 32-48, o padrão,
            no Ciclo; 32-44 em Soluções e Dados; 32-52 em Integrações.
          </>
        }
      >
        <State state="32-48" size="full">
          <SectionTitle className="max-w-215">
            Dois times, um ciclo. O Red Team procura a falha. O Blue Team fecha a falha.
          </SectionTitle>
        </State>
        <State state="32-44" size="full">
          <SectionTitle size="32-44" className="max-w-205">
            Do ataque simulado à proteção de cada conversa em produção.
          </SectionTitle>
        </State>
        <State state="32-52" size="full">
          <SectionTitle size="32-52" className="max-w-265">
            Protegemos cada conversa entre clientes e agentes, em produção e em tempo real.
          </SectionTitle>
        </State>
      </Specimen>

      <Specimen
        name="NeonSquare"
        title="<NeonSquare>"
        file="neon-square.tsx"
        about={
          <>
            O quadrado que brilha: um brilho desfocado, uma luz pouco desfocada e o quadrado nítido
            por cima. <Prop>team</Prop> violet, o padrão, nos sobretítulos; red e blue nos times.{" "}
            <Prop>size</Prop> regular, de 10 px, ou small, de 8 px, nos cabeçalhos dos times e nas
            etapas.
          </>
        }
      >
        <State state="violet" variant="regular">
          <NeonSquare />
        </State>
        <State state="red" variant="regular">
          <NeonSquare team="red" />
        </State>
        <State state="blue" variant="regular">
          <NeonSquare team="blue" />
        </State>
        <State state="red" variant="small">
          <NeonSquare team="red" size="small" />
        </State>
        <State state="blue" variant="small">
          <NeonSquare team="blue" size="small" />
        </State>
      </Specimen>

      <Specimen
        name="Caption"
        title="<Caption>"
        file="caption.tsx"
        about={
          <>
            A legenda com abertura em branco. <Prop>variant</Prop> card, no pé de um cartão de
            solução; bento, nos cartões de Integrações, com altura mínima; feature, no cinza dos
            textos de Dados.
          </>
        }
      >
        <State state="card" size="medium">
          <Caption lead="Adapta a cada turno." variant="card">
            Um agente autônomo que conversa com o agente-alvo, muda de estratégia a cada turno e
            registra tudo o que conseguiu.
          </Caption>
        </State>
        <State state="bento" size="medium">
          <Caption lead="Entrada." variant="bento">
            Os guardrails de entrada avaliam a mensagem do cliente antes de ela chegar ao agente.
          </Caption>
        </State>
        <State state="feature" size="medium">
          <Caption lead="Acionamentos." variant="feature">
            Quantas vezes cada guardrail entrou em ação, por agente e por dia.
          </Caption>
        </State>
      </Specimen>

      <Specimen
        name="IllustrationFrame"
        title="<IllustrationFrame>"
        file="illustration-frame.tsx"
        about={
          <>
            O quadro do desenho de um cartão de solução: tão largo quanto o cartão, em 324:255, em
            mono pequeno. Os desenhos põem as marcas em % dele. <Prop>label</Prop> diz o que o
            desenho mostra; <Prop>className</Prop> dá o leiaute ou o fundo, aqui o pautado do Agente
            de Ataque, sem o desenho.
          </>
        }
      >
        <State state="vazio" size="medium">
          <div className="mx-auto w-full max-w-80">
            <IllustrationFrame label="O quadro de um desenho, vazio" className="bg-ruled">
              {null}
            </IllustrationFrame>
          </div>
        </State>
      </Specimen>

      <Specimen
        title="Desenhos das soluções"
        file="*-illustration.tsx"
        about="Um desenho por solução, cada um no próprio arquivo, sem propriedades: as posições ficam em % do quadro, e as cores vêm dos tokens. Na largura de um cartão da Home."
      >
        {ILLUSTRATIONS.map(([name, label, drawing]) => (
          <State key={name} state={label} component={name} size="medium">
            <div className="mx-auto w-full max-w-80">{drawing}</div>
          </State>
        ))}
      </Specimen>

      <Specimen
        name="Eyebrow"
        title="<Eyebrow>"
        file="eyebrow.tsx"
        about={
          <>
            O sobretítulo de uma seção: uma etiqueta mono em caixa alta, com borda e o quadrado
            violeta. <Prop>align</Prop> start, o padrão, ou center, em Integrações. Em 760 px e
            menos o texto cai para 13 px.
          </>
        }
      >
        <State state="start" size="medium">
          <div className="flex w-full flex-col">
            <Eyebrow>Ciclo integrado</Eyebrow>
          </div>
        </State>
        <State state="center" size="medium">
          <div className="flex w-full flex-col">
            <Eyebrow align="center">Integrações</Eyebrow>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="CycleTabs"
        title="<CycleTabs>"
        file="cycle-tabs.tsx"
        about={
          <>
            A barra das abas do ciclo, fixa sob o cabeçalho: cinco colunas de pelo menos 136 px, que
            rolam de lado quando não cabem. Na Home a aba atual acompanha a etapa à vista e o clique
            leva à etapa; aqui, sem as etapas, a primeira fica atual. <Prop>tabs</Prop> lista o
            alvo, o rótulo e o ícone de cada aba.
          </>
        }
      >
        <State state="na Home" size="full">
          <div className="w-full min-w-0">
            <CycleTabs tabs={CYCLE_TABS} />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="CycleTab"
        title="<CycleTab>"
        file="cycle-tab.tsx"
        about={
          <>
            Uma aba da barra: uma âncora para a etapa, não uma aba de ARIA. Texto cinza que fica
            branco em hover; <Prop>current</Prop> marca a aba atual, num fundo mais claro e em
            branco, e diz isso com <Prop>aria-current</Prop>. O anel de foco fica por dentro.
          </>
        }
      >
        <Interactive variant="não atual">
          <div className="flex min-w-34 border border-rule bg-page">
            <CycleTab href="#cycle-step-2" icon={<DiscoverIcon />} current={false}>
              Descobrir
            </CycleTab>
          </div>
        </Interactive>
        <State state="atual">
          <div className="flex min-w-34 border border-rule bg-page">
            <CycleTab href="#cycle-step-1" icon={<AttackIcon />} current>
              Atacar
            </CycleTab>
          </div>
        </State>
      </Specimen>

      <Specimen
        title="Ícones das abas"
        file="cycle-icons.tsx"
        about="Os cinco ícones de linha das abas, de 18 px, traçados na cor do texto da aba e um pouco apagados."
      >
        {CYCLE_ICONS.map(([name, label, icon]) => (
          <State key={name} state={label} component={name}>
            <span className="text-muted">{icon}</span>
          </State>
        ))}
      </Specimen>

      <Specimen
        name="MediaPlaceholder"
        title="<MediaPlaceholder>"
        file="media-placeholder.tsx"
        about={
          <>
            Um espaço de mídia que o design deixou aberto, uma Lacuna: a caixa escura com o rótulo
            no meio, nunca preenchida. <Prop>label</Prop> diz o formato da mídia;{" "}
            <Prop>variant</Prop> card, com raio e borda, em Integrações, ou step, com o filete só do
            lado do texto, nas etapas do ciclo; <Prop>className</Prop> dá o tamanho de cada uso.
          </>
        }
      >
        <State state="card" size="medium">
          <MediaPlaceholder label="inserir gif · 16:10" className="aspect-16/10 w-full" />
        </State>
        <State state="step" size="medium">
          <MediaPlaceholder
            variant="step"
            label="inserir gif · 6:5"
            className="aspect-6/5 w-full"
          />
        </State>
      </Specimen>

      <Specimen
        name="PlaceholderMark"
        title="<PlaceholderMark>"
        file="media-placeholder.tsx"
        about="O rótulo de um espaço de mídia: mono pequeno em caixa alta, fora do alcance do ponteiro e da tecnologia assistiva. A chamada final põe o seu sozinho, no meio da seção."
      >
        <State state="padrão">
          <PlaceholderMark label="inserir gif · 2:1" />
        </State>
      </Specimen>

      <Specimen
        name="DataChartIllustration"
        title="<DataChartIllustration>"
        file="data-chart-illustration.tsx"
        about="O gráfico de Dados, ilustrativo e sem valores: catorze barras de acionamentos por dia, com fatias de falsos positivos no topo de algumas, e a do oitavo dia em destaque."
      >
        <State state="padrão" size="full">
          <div className="w-full">
            <DataChartIllustration />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="FooterLink"
        title="<FooterLink>"
        file="footer-link.tsx"
        about={
          <>
            Um link do rodapé: cinza, branco em hover, com alvo de 44 px; toma o tamanho da coluna
            onde está. <Prop>href</Prop> é uma âncora da Home; sem ele o link leva a uma Tela que
            ainda não existe, é Lacuna e fica inerte.
          </>
        }
      >
        <Interactive>
          <div className="flex flex-col text-14">
            <FooterLink>Playground</FooterLink>
          </div>
        </Interactive>
      </Specimen>
    </div>
  );
}
