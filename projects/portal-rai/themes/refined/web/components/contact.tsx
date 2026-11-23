import { buttonClassName } from "./button-link";
import { MediaMark } from "./media-placeholder";
import { Paragraph } from "./paragraph";
import { Pill } from "./pill";
import { Section } from "./section";

// A form field (rf-input): a dark field with a 1px border that shows on hover, its placeholder in the
// media marks' gray, and a focus ring closer than the page's. 48px tall at least; the message, 132px.
const FIELD =
  "w-full rounded-10 border border-transparent bg-field px-4 py-3 text-16 text-bright tracking-tight-10 placeholder:text-mark hover:border-field-border focus-visible:outline-offset-field";

const LABEL = "font-medium text-13 text-muted tracking-tight-10";

// Contato: a media card with its pill, the title and a line on the media, next to the form; under both,
// the team's direct channels. The design left the form without a destination (a design gap): there is no
// <form>, the button is a plain button that sends nothing and goes nowhere, and the fields take typing.
export function Contact() {
  return (
    <Section block="contact" id="contato" labelledBy="contact-title">
      <div className="grid grid-cols-2 gap-4 narrow:grid-cols-1">
        <div className="relative flex min-h-120 flex-col items-stretch justify-between gap-12 overflow-hidden rounded-16 bg-surface p-6">
          <MediaMark className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            inserir imagem · 4:5
          </MediaMark>
          <div className="relative flex flex-col items-start gap-4">
            <Pill>Fale com o time</Pill>
            <h2
              id="contact-title"
              className="text-balance font-normal text-32 text-bright leading-115 tracking-tight-30"
            >
              Coloque seu agente à prova.
            </h2>
          </div>
          <Paragraph tone="pale" className="relative max-w-85">
            Conte qual agente você quer proteger: o Red Team ataca primeiro, o Blue Team protege
            sempre.
          </Paragraph>
        </div>
        <div className="flex flex-col gap-3.5 rounded-16 bg-surface p-4">
          <div className="flex flex-col gap-2">
            <label className={LABEL} htmlFor="contact-name">
              Nome
            </label>
            <input
              id="contact-name"
              className={`${FIELD} min-h-12`}
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Seu nome"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className={LABEL} htmlFor="contact-email">
              E-mail
            </label>
            <input
              id="contact-email"
              className={`${FIELD} min-h-12`}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Seu e-mail"
            />
          </div>
          <div className="flex flex-auto flex-col gap-2">
            <label className={LABEL} htmlFor="contact-message">
              Como podemos ajudar?
            </label>
            <textarea
              id="contact-message"
              className={`${FIELD} min-h-33 flex-auto resize-y`}
              name="message"
              rows={5}
              placeholder="Conte sobre o seu agente"
            />
          </div>
          <button type="button" className={buttonClassName("primary", "w-full")}>
            Enviar mensagem
          </button>
        </div>
      </div>
      <Paragraph small className="mt-5 text-center">
        Ou fale direto: [CANAL DO TIME] · [E-MAIL DO TIME]
      </Paragraph>
    </Section>
  );
}
