import { buttonClassName } from "./button-link";
import { FormField } from "./form-field";
import { MediaMark } from "./media-placeholder";
import { Paragraph } from "./paragraph";
import { Pill } from "./pill";
import { Section } from "./section";

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
          <FormField
            id="contact-name"
            label="Nome"
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
          />
          <FormField
            id="contact-email"
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Seu e-mail"
          />
          <FormField
            id="contact-message"
            label="Como podemos ajudar?"
            type="message"
            name="message"
            placeholder="Conte sobre o seu agente"
          />
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
