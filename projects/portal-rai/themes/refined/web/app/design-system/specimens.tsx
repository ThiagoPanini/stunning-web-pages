import type { ReactNode } from "react";
import { Bezel } from "@/components/bezel";
import { BrandMark } from "@/components/brand-mark";
import { ButtonLink, type ButtonVariant } from "@/components/button-link";
import { CheckRow } from "@/components/check-row";
import { ChipStrip } from "@/components/chip-strip";
import { CycleStep } from "@/components/cycle-step";
import { AnswerLink, FaqAccordion, FaqItem } from "@/components/faq-accordion";
import { FooterLink } from "@/components/footer-link";
import { FormField } from "@/components/form-field";
import { IconDisc } from "@/components/icon-disc";
import { InertLink } from "@/components/inert-link";
import { MediaMark, MediaPlaceholder } from "@/components/media-placeholder";
import { NavLink } from "@/components/nav-link";
import { NavPill } from "@/components/nav-pill";
import { OndasCaption } from "@/components/ondas-caption";
import { OndasLogo } from "@/components/ondas-logo";
import { Paragraph } from "@/components/paragraph";
import { Pill } from "@/components/pill";
import { PortalCardLink } from "@/components/portal-card-link";
import { ScrollProgress } from "@/components/scroll-progress";
import { Column, Section } from "@/components/section";
import { SectionHeader } from "@/components/section-header";

// Each component of the Home on its own, with the same files the Home is built with and, where the Home
// has it, the same text. A component that changes under the pointer or the keyboard is shown at rest,
// then hovered and focused: inside data-show-state the theme draws that state with no pointer or keyboard
// on it (app/globals.css). The questions show open and closed, the chip strip running and paused, the
// cycle step unlit and lit, the logo animated and still. Components with no state of their own show their
// variants.

type SpecimenProps = {
  name: string;
  file: string;
  about: ReactNode;
  children: ReactNode;
};

function Specimen({ name, file, about, children }: SpecimenProps) {
  return (
    <article data-component={name} className="flex flex-col gap-6 border-bright-9 border-t pt-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="text-16 text-bright">
            <code>{`<${name}>`}</code>
          </h3>
          <code className="text-12 text-muted">components/{file}</code>
        </div>
        <Paragraph className="max-w-160">{about}</Paragraph>
      </div>
      <div className="flex flex-wrap gap-4">{children}</div>
    </article>
  );
}

type StateProps = {
  // The caption, as interface text: "repouso" for the state at rest, otherwise the name of the state
  // or the variant. data-state carries it too, so a test finds a state by the caption it shows.
  label: string;
  // A component with several variants that each have their states (the three buttons) gives each cell
  // its variant, in data-variant and in the caption.
  variant?: string;
  // Draws the component hovered, focused, or, for the text that lights up, before it lights up.
  show?: "hover" | "focus" | "unlit";
  size?: "small" | "medium" | "large";
  children: ReactNode;
};

// Medium and large cells stop growing near the width the component has on the Home.
const cellSize = {
  small: "basis-50",
  medium: "basis-80 max-w-160",
  large: "basis-110 max-w-220",
};

function State({ label, variant, show, size = "small", children }: StateProps) {
  return (
    <figure
      data-state={label}
      data-variant={variant}
      className={`flex min-w-0 grow flex-col gap-5 rounded-16 border border-bright-9 p-6 ${cellSize[size]}`}
    >
      <figcaption className="font-medium text-12 text-mark uppercase tracking-wide-140">
        {variant ? `${variant} · ${label}` : label}
      </figcaption>
      <div data-show-state={show} className="flex min-h-11 flex-wrap items-center gap-4">
        {children}
      </div>
    </figure>
  );
}

const Prop = ({ children }: { children: ReactNode }) => (
  <code className="text-14 text-bright">{children}</code>
);

// A block of the Home, in a cell: the width of the cell, as in its column.
const Whole = ({ children }: { children: ReactNode }) => (
  <div className="w-full min-w-0">{children}</div>
);

const BUTTONS: { variant: ButtonVariant; label: string; text: string }[] = [
  { variant: "primary", label: "primary", text: "Testar um guardrail" },
  { variant: "secondary", label: "secondary", text: "Ver os dados" },
  { variant: "header", label: "header", text: "Testar um guardrail" },
];

// The drawing of the attack agent's icon, from the solutions, for the icon discs.
function TargetIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="6" />
      <path d="M10 1.75v3.5M10 14.75v3.5M1.75 10h3.5M14.75 10h3.5" />
    </svg>
  );
}

const QUESTION = {
  question: "O que o time de Responsible AI faz?",
  answer:
    "Pesquisa, desenvolve e implementa os guardrails dos agentes conversacionais de IA da companhia: do ataque simulado à proteção de cada conversa em produção.",
};

const OTHER_QUESTION = {
  question: "Como testo um guardrail?",
  answer: (
    <>
      No <AnswerLink>Playground</AnswerLink>: cole uma mensagem, escolha os guardrails e veja o
      veredito de cada um. Ou deixe o agente de ataque do Red Team tentar primeiro.
    </>
  ),
};

const PORTAL_CARD = {
  name: "Dados",
  description: "Acionamentos, falsos positivos e latência de cada guardrail.",
  action: "Ver",
  mark: "inserir gif · 4:3",
  aspect: "aspect-4-3",
};

const CYCLE_STEP = {
  title: "Atacar os agentes antes que alguém de fora ataque",
  team: "Red Team",
  icon: "next",
  number: 1,
  total: 5,
} as const;

export function ComponentSpecimens() {
  return (
    <div className="flex flex-col gap-14">
      <Specimen
        name="OndasLogo"
        file="ondas-logo.tsx"
        about={
          <>
            O logo Ondas em caracteres, desenhado quadro a quadro: o mesmo arquivo nos três Temas.{" "}
            <Prop>animated</Prop> desligado deixa o logo parado no quadro de partida, como o
            movimento reduzido. <Prop>frame</Prop> escolhe o quadro de partida e{" "}
            <Prop>background</Prop> a cor do fundo; a Home passa a cor da página.
          </>
        }
      >
        <State label="animado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo />
          </div>
        </State>
        <State label="parado" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo animated={false} />
          </div>
        </State>
        <State label="fundo da página" size="medium">
          <div className="mx-auto w-full max-w-80">
            <OndasLogo background="var(--color-night)" />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="OndasCaption"
        file="ondas-caption.tsx"
        about="A legenda do logo: o caractere de cada parte do desenho, na cor em que o logo o desenha, e o que ele representa."
      >
        <State label="padrão" size="medium">
          <OndasCaption />
        </State>
      </Specimen>

      <Specimen
        name="ChipStrip"
        file="chip-strip.tsx"
        about="A faixa de chips da abertura: o que os guardrails avaliam, esmaecida nas duas pontas. Com movimento ela corre para o lado e para sob o ponteiro; com movimento reduzido fica parada nos primeiros chips."
      >
        <State label="rolando" size="medium">
          <ChipStrip />
        </State>
        <State label="hover" show="hover" size="medium">
          <ChipStrip />
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
            O botão. <Prop>variant</Prop> primary, o creme, que sobe 1 px e brilha mais em hover;
            secondary, o escuro, que clareia; header, o creme menor do cabeçalho, sem brilho até o
            hover. Sem <Prop>href</Prop> é Lacuna e fica inerte, como todos os botões da Home; o
            botão do formulário usa as mesmas classes, por <Prop>buttonClassName</Prop>.
          </>
        }
      >
        {BUTTONS.map(({ variant, label, text }) => (
          <div key={variant} className="flex w-full flex-wrap gap-4">
            <State label="repouso" variant={label}>
              <ButtonLink variant={variant}>{text}</ButtonLink>
            </State>
            <State label="hover" variant={label} show="hover">
              <ButtonLink variant={variant}>{text}</ButtonLink>
            </State>
            <State label="foco" variant={label} show="focus">
              <ButtonLink variant={variant}>{text}</ButtonLink>
            </State>
          </div>
        ))}
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
        name="ScrollProgress"
        file="scroll-progress.tsx"
        about="A barra creme na borda de baixo do cabeçalho, que cresce com a rolagem da página, de largura zero no topo à largura toda no fim. Aqui ela segue a rolagem desta rota; com movimento reduzido fica em zero."
      >
        <State label="ao rolar" size="medium">
          <div className="relative h-11 w-full border-white-7 border-b bg-header">
            <ScrollProgress />
          </div>
        </State>
      </Specimen>

      <Specimen
        name="SectionHeader"
        file="section-header.tsx"
        about={
          <>
            A cabeça de cada seção: o título com a contagem, um filete que toma o resto da linha e
            um link creme opcional, que sublinha em hover. <Prop>count</Prop> e <Prop>link</Prop>{" "}
            são opcionais; em 480 px e abaixo título e link encolhem.
          </>
        }
      >
        <State label="repouso" size="large">
          <Whole>
            <SectionHeader
              id="specimen-header-rest"
              title="Times"
              count={2}
              link={{ label: "Ver o ciclo", href: "/#ciclo" }}
            />
          </Whole>
        </State>
        <State label="hover" show="hover" size="large">
          <Whole>
            <SectionHeader
              id="specimen-header-hover"
              title="Times"
              count={2}
              link={{ label: "Ver o ciclo", href: "/#ciclo" }}
            />
          </Whole>
        </State>
        <State label="foco" show="focus" size="large">
          <Whole>
            <SectionHeader
              id="specimen-header-focus"
              title="Times"
              count={2}
              link={{ label: "Ver o ciclo", href: "/#ciclo" }}
            />
          </Whole>
        </State>
        <State label="sem contagem" size="large">
          <Whole>
            <SectionHeader id="specimen-header-plain" title="Na prática" />
          </Whole>
        </State>
      </Specimen>

      <Specimen
        name="Section"
        file="section.tsx"
        about={
          <>
            A casca de cada seção depois da abertura: o espaço fluido acima e o conteúdo na coluna.{" "}
            <Prop>block</Prop> é o nome do bloco, pelo qual o teste o acha, e <Prop>id</Prop> a
            âncora; uma âncora rola a seção para 72 px abaixo do topo, livre do cabeçalho.
          </>
        }
      >
        <State label="padrão" size="large">
          <div className="w-full min-w-0 rounded-16 bg-surface">
            <Section block="specimen" id="secao-exemplo" labelledBy="specimen-section-title">
              <SectionHeader id="specimen-section-title" title="Seção" count={1} />
            </Section>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="Column"
        file="section.tsx"
        about="A coluna em que cada seção e o rodapé põem o conteúdo: no máximo 880 px, centrada, a 20 px das bordas da janela."
      >
        <State label="padrão" size="large">
          <div className="w-full min-w-0 rounded-16 bg-surface py-6">
            <Column>
              <Paragraph>O conteúdo de uma seção.</Paragraph>
            </Column>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="Paragraph"
        file="paragraph.tsx"
        about={
          <>
            O parágrafo das seções, sem palavra sozinha na última linha. <Prop>small</Prop> passa a
            14 px, como as notas; <Prop>tone</Prop> pale é o texto sobre mídia.
          </>
        }
      >
        <State label="padrão" size="medium">
          <Paragraph>Ataca os agentes antes que alguém de fora ataque.</Paragraph>
        </State>
        <State label="pequeno" size="medium">
          <Paragraph small>
            A cada nova versão de agente, o ciclo recomeça com o Red Team.
          </Paragraph>
        </State>
        <State label="sobre mídia" size="medium">
          <div className="w-full rounded-16 bg-surface p-6">
            <Paragraph tone="pale">
              Conte qual agente você quer proteger: o Red Team ataca primeiro, o Blue Team protege
              sempre.
            </Paragraph>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="Pill"
        file="pill.tsx"
        about={
          <>
            A pílula: texto claro sobre um fundo leve. <Prop>dot</Prop> põe antes do texto o ponto
            do time, red ou blue; <Prop>onMedia</Prop> a põe no canto de uma mídia, sobre um escuro
            translúcido que desfoca o que está atrás.
          </>
        }
      >
        <State label="padrão">
          <Pill>Fale com o time</Pill>
        </State>
        <State label="red">
          <Pill dot="red">Ofensiva · antes da produção</Pill>
        </State>
        <State label="blue">
          <Pill dot="blue">Defensiva · em produção</Pill>
        </State>
        <State label="sobre mídia" size="medium">
          <MediaPlaceholder mark="inserir vídeo · 16:10" className="aspect-16-10 w-full">
            <Pill dot="red" onMedia>
              Ofensiva · antes da produção
            </Pill>
          </MediaPlaceholder>
        </State>
      </Specimen>

      <Specimen
        name="MediaPlaceholder"
        file="media-placeholder.tsx"
        about={
          <>
            O espaço reservado de mídia, uma Lacuna: a caixa arredondada com o rótulo no meio.{" "}
            <Prop>mark</Prop> é o rótulo, a proporção vem em <Prop>className</Prop>, e o que fica
            sobre a mídia, como a pílula, entra como filho.
          </>
        }
      >
        <State label="16:10" size="medium">
          <MediaPlaceholder mark="inserir vídeo · 16:10" className="aspect-16-10 w-full" />
        </State>
        <State label="4:3" size="medium">
          <MediaPlaceholder mark="inserir gif · 4:3" className="aspect-4-3 w-full" />
        </State>
      </Specimen>

      <Specimen
        name="MediaMark"
        file="media-placeholder.tsx"
        about="O rótulo de um espaço reservado de mídia, em caixa alta espaçada, fora do caminho do ponteiro e da tecnologia assistiva. Solto, serve à mídia do contato, que tem layout próprio."
      >
        <State label="padrão">
          <MediaMark>inserir imagem · 4:5</MediaMark>
        </State>
      </Specimen>

      <Specimen
        name="IconDisc"
        file="icon-disc.tsx"
        about={
          <>
            Um ícone num disco de 44 px, decorativo. <Prop>tone</Prop> icon, o cinza claro do ciclo,
            ou red e blue, a cor do time nas soluções.
          </>
        }
      >
        <State label="icon">
          <IconDisc>
            <TargetIcon />
          </IconDisc>
        </State>
        <State label="red">
          <IconDisc tone="red">
            <TargetIcon />
          </IconDisc>
        </State>
        <State label="blue">
          <IconDisc tone="blue">
            <TargetIcon />
          </IconDisc>
        </State>
      </Specimen>

      <Specimen
        name="Bezel"
        file="bezel.tsx"
        about={
          <>
            O cartão em moldura: um quadro claro, 8 px em volta de um miolo escuro de raio menor.{" "}
            <Prop>layout</Prop> spread empurra o conteúdo para o alto e para o pé do miolo, como nas
            soluções; stack o empilha do alto, como na prática.
          </>
        }
      >
        <State label="spread" size="medium">
          <ul className="w-full">
            <Bezel coreClassName="min-h-86">
              <IconDisc tone="red">
                <TargetIcon />
              </IconDisc>
              <Paragraph>Um agente autônomo que conversa com o agente-alvo.</Paragraph>
            </Bezel>
          </ul>
        </State>
        <State label="stack" size="medium">
          <div className="w-full">
            <Bezel as="article" layout="stack">
              <Paragraph>Red Team · ataque simulado contra o agente de atendimento.</Paragraph>
              <ButtonLink className="w-full">Deixar o agente de ataque tentar</ButtonLink>
            </Bezel>
          </div>
        </State>
      </Specimen>

      <Specimen
        name="CycleStep"
        file="cycle-step.tsx"
        about={
          <>
            Uma etapa do ciclo entre filetes: o título, que acende do apagado ao claro ao entrar na
            janela, o time com o ponto na cor dele e “etapa n de 5”, e o ícone num disco.{" "}
            <Prop>icon</Prop> next leva à etapa seguinte; again, a última, volta à primeira. Com
            movimento reduzido o título já está aceso.
          </>
        }
      >
        <State label="apagado" show="unlit" size="large">
          <ol className="w-full border-bright-9 border-t">
            <CycleStep {...CYCLE_STEP} />
          </ol>
        </State>
        <State label="aceso" size="large">
          <ol className="w-full border-bright-9 border-t">
            <CycleStep {...CYCLE_STEP} />
          </ol>
        </State>
      </Specimen>

      <Specimen
        name="CheckRow"
        file="check-row.tsx"
        about={
          <>
            Uma linha do checklist da prática: a marca, o texto e o resultado no fim da linha.{" "}
            <Prop>mark</Prop> check, cross ou shield; <Prop>tone</Prop> pinta marca e resultado de
            red, o que passou pelo ataque, ou blue, o que um guardrail barrou.
          </>
        }
      >
        <State label="marcas" size="large">
          <ul className="flex w-full flex-col gap-2.5">
            <CheckRow mark="check" text="Turno 1 · pedido legítimo" result="respondeu" />
            <CheckRow
              mark="cross"
              text="Turno 4 · ofuscação com números"
              result="passou"
              tone="red"
            />
            <CheckRow
              mark="shield"
              text="prompt_injection · score 0,93"
              result="bloqueada"
              tone="blue"
            />
          </ul>
        </State>
      </Specimen>

      <Specimen
        name="PortalCardLink"
        file="portal-card-link.tsx"
        about={
          <>
            O cartão-link do portal: a mídia, o nome com a linha dele e a etiqueta da ação. Em hover
            a mídia clareia e a etiqueta inverte para o creme. A Tela que ele abre ainda não existe,
            uma Lacuna: o cartão fica inerte. <Prop>wide</Prop> o estende pela linha da grade.
          </>
        }
      >
        <State label="repouso">
          <Whole>
            <PortalCardLink {...PORTAL_CARD} />
          </Whole>
        </State>
        <State label="hover" show="hover">
          <Whole>
            <PortalCardLink {...PORTAL_CARD} />
          </Whole>
        </State>
        <State label="foco" show="focus">
          <Whole>
            <PortalCardLink {...PORTAL_CARD} />
          </Whole>
        </State>
      </Specimen>

      <Specimen
        name="FaqAccordion"
        file="faq-accordion.tsx"
        about={
          <>
            O acordeão das perguntas, da Base UI: cada pergunta abre e fecha sozinha, com o estado
            anunciado. <Prop>defaultOpen</Prop> diz quais chegam abertas; a Home abre a primeira.
          </>
        }
      >
        <State label="repouso" size="large">
          <Whole>
            <FaqAccordion defaultOpen={[0]}>
              <FaqItem index={0} question={QUESTION.question}>
                {QUESTION.answer}
              </FaqItem>
              <FaqItem index={1} question={OTHER_QUESTION.question}>
                {OTHER_QUESTION.answer}
              </FaqItem>
            </FaqAccordion>
          </Whole>
        </State>
        {/* One question: the state draws every button of its cell focused. */}
        <State label="foco" show="focus" size="large">
          <Whole>
            <FaqAccordion defaultOpen={[0]}>
              <FaqItem index={0} question={QUESTION.question}>
                {QUESTION.answer}
              </FaqItem>
            </FaqAccordion>
          </Whole>
        </State>
      </Specimen>

      <Specimen
        name="FaqItem"
        file="faq-accordion.tsx"
        about="Uma pergunta e a resposta dela, dentro do acordeão. Aberta, o mais do ícone gira 45° e vira um ×, e a resposta aparece sem animar a altura; fechada, a resposta sai da página."
      >
        <State label="aberta" size="large">
          <Whole>
            <FaqAccordion defaultOpen={[0]}>
              <FaqItem index={0} question={QUESTION.question}>
                {QUESTION.answer}
              </FaqItem>
            </FaqAccordion>
          </Whole>
        </State>
        <State label="fechada" size="large">
          <Whole>
            <FaqAccordion>
              <FaqItem index={0} question={QUESTION.question}>
                {QUESTION.answer}
              </FaqItem>
            </FaqAccordion>
          </Whole>
        </State>
      </Specimen>

      <Specimen
        name="AnswerLink"
        file="faq-accordion.tsx"
        about="Um link dentro de uma resposta, creme e sublinhado, para uma Tela que o design deixou aberta: uma Lacuna, inerte."
      >
        <State label="repouso">
          <Paragraph>
            No <AnswerLink>Playground</AnswerLink>
          </Paragraph>
        </State>
        <State label="foco" show="focus">
          <Paragraph>
            No <AnswerLink>Playground</AnswerLink>
          </Paragraph>
        </State>
      </Specimen>

      <Specimen
        name="FormField"
        file="form-field.tsx"
        about={
          <>
            Um campo do formulário de contato, com o rótulo acima: a borda aparece em hover e o anel
            do foco fica mais perto que o da página. <Prop>type</Prop> text, email ou message, a
            área de texto que toma a altura que sobra. O formulário não tem destino, uma Lacuna: os
            campos aceitam digitação e nada é enviado.
          </>
        }
      >
        <State label="repouso" size="medium">
          <Whole>
            <FormField id="specimen-field-rest" label="Nome" name="name" placeholder="Seu nome" />
          </Whole>
        </State>
        <State label="hover" show="hover" size="medium">
          <Whole>
            <FormField id="specimen-field-hover" label="Nome" name="name" placeholder="Seu nome" />
          </Whole>
        </State>
        <State label="foco" show="focus" size="medium">
          <Whole>
            <FormField id="specimen-field-focus" label="Nome" name="name" placeholder="Seu nome" />
          </Whole>
        </State>
        <State label="mensagem" size="medium">
          <Whole>
            <FormField
              id="specimen-field-message"
              label="Como podemos ajudar?"
              type="message"
              name="message"
              placeholder="Conte sobre o seu agente"
            />
          </Whole>
        </State>
      </Specimen>

      <Specimen
        name="FooterLink"
        file="footer-link.tsx"
        about={
          <>
            Um link do rodapé, apagado, que acende em hover, com alvo de 44 px; toma o tamanho de
            onde está. <Prop>current</Prop> marca a página aberta. Sem <Prop>href</Prop> é Lacuna e
            fica inerte.
          </>
        }
      >
        <State label="repouso">
          <span className="text-15">
            <FooterLink>Dados</FooterLink>
          </span>
        </State>
        <State label="hover" show="hover">
          <span className="text-15">
            <FooterLink>Dados</FooterLink>
          </span>
        </State>
        <State label="foco" show="focus">
          <span className="text-15">
            <FooterLink>Dados</FooterLink>
          </span>
        </State>
        <State label="atual">
          <span className="text-15">
            <FooterLink href="/" current>
              Home
            </FooterLink>
          </span>
        </State>
      </Specimen>

      <Specimen
        name="InertLink"
        file="inert-link.tsx"
        about="A base dos links sem destino, as Lacunas: parece e recebe foco como link, diz que está indisponível e não navega. Não tem estilo próprio; quem o usa dá a classe."
      >
        <State label="repouso">
          <InertLink>Integrações</InertLink>
        </State>
        <State label="foco" show="focus">
          <InertLink>Integrações</InertLink>
        </State>
      </Specimen>
    </div>
  );
}
