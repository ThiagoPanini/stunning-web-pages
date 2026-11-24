"use client";

import { useState, useSyncExternalStore } from "react";

// The board's tweaks, with its names, options and defaults: the app draws every version, and the author
// picks one later. The page shows the defaults; the query string picks another version
// (/?versaoCiclo=02-fio&versaoCards=02-surprise&efeitoNeon=contorno), so a link opens the version it
// names, and the panel below changes the query string in place.
//
// The panel is the catalog's, not the design's: a consumer who rebuilds the theme keeps the chosen
// version and leaves the panel and the other versions out (HANDOFF.md).

export const TWEAKS = {
  versaoCiclo: {
    section: "Modelo · ciclo",
    options: ["01-orbita", "02-fio", "03-cartoes", "04-gif"],
    default: "01-orbita",
  },
  versaoCards: {
    section: "Times · cards",
    options: ["01-simple", "02-surprise", "03-middle"],
    default: "03-middle",
  },
  efeitoNeon: {
    section: "Times · Versão 02",
    options: ["preenchimento", "contorno", "holofote"],
    default: "preenchimento",
  },
} as const;

export type TweakName = keyof typeof TWEAKS;
export type Tweaks = { [Name in TweakName]: (typeof TWEAKS)[Name]["options"][number] };
export type CycleVersion = Tweaks["versaoCiclo"];
export type CardsVersion = Tweaks["versaoCards"];
export type NeonEffect = Tweaks["efeitoNeon"];

const TWEAK_NAMES = Object.keys(TWEAKS) as TweakName[];
const CHANGE = "tweakschange";

// The tweaks a query string names; a missing or unknown value is the default.
export function parseTweaks(search: string): Tweaks {
  const params = new URLSearchParams(search);
  const tweaks = {} as Record<TweakName, string>;
  for (const name of TWEAK_NAMES) {
    const value = params.get(name);
    const { options, default: fallback } = TWEAKS[name];
    tweaks[name] = value && (options as readonly string[]).includes(value) ? value : fallback;
  }
  return tweaks as Tweaks;
}

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

// The export is static: the HTML has the defaults, and the query string is read once the page runs.
export function useTweaks(): Tweaks {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  return parseTweaks(search);
}

// Writes a tweak to the query string, leaving the defaults out, without a new history entry.
function setTweak<Name extends TweakName>(name: Name, value: Tweaks[Name]) {
  const params = new URLSearchParams(window.location.search);
  if (value === TWEAKS[name].default) params.delete(name);
  else params.set(name, value);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(CHANGE));
}

// The panel in the bottom right corner: closed, a button; open, one group of choices per tweak, in the
// board's sections. The neon only shows on the cards' Version 02, which the panel says.
export function TweaksPanel() {
  const tweaks = useTweaks();
  const [open, setOpen] = useState(false);
  return (
    <div
      data-tweaks-panel
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 font-sans text-bright"
    >
      {open && (
        <section
          id="tweaks"
          aria-label="Tweaks do Quadro"
          className="flex w-72 flex-col gap-4 rounded-16 border border-rule-strong bg-surface p-4 shadow-glow"
        >
          <p className="text-13 text-subtle leading-150">
            As versões do design. A escolha vai para o endereço da página.
          </p>
          {TWEAK_NAMES.map((name) => {
            const tweak = TWEAKS[name];
            const idle = name === "efeitoNeon" && tweaks.versaoCards !== "02-surprise";
            return (
              <fieldset key={name} className="flex flex-col gap-2">
                <legend className="mb-2 flex w-full items-baseline justify-between gap-2">
                  <span className="font-medium text-14">{tweak.section}</span>
                  <span className="font-mono text-11 text-subtle">{name}</span>
                </legend>
                <div className="flex flex-wrap gap-1">
                  {tweak.options.map((option) => {
                    const checked = tweaks[name] === option;
                    return (
                      <label
                        key={option}
                        className={`flex h-8 cursor-pointer items-center rounded-pill border px-3 font-mono text-12 transition-[color,background-color,border-color] has-focus-visible:outline-2 has-focus-visible:outline-blue has-focus-visible:outline-offset-2 ${
                          checked
                            ? "border-rule-lit bg-white-10 text-bright"
                            : "border-rule-strong text-muted hover:text-bright"
                        }`}
                      >
                        <input
                          type="radio"
                          name={name}
                          value={option}
                          checked={checked}
                          onChange={() => setTweak(name, option)}
                          className="sr-only"
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
                {idle && (
                  <p className="text-12 text-subtle leading-150">
                    Aparece no hover dos cards 02-surprise.
                  </p>
                )}
              </fieldset>
            );
          })}
        </section>
      )}
      <button
        type="button"
        aria-expanded={open}
        aria-controls="tweaks"
        onClick={() => setOpen(!open)}
        className="inline-flex h-10 items-center gap-2 rounded-pill border border-rule-strong bg-surface px-4 font-medium text-14 transition-[border-color] hover:border-rule-lit"
      >
        <span aria-hidden="true" className="size-2 rounded-circle bg-blue" />
        {open ? "Fechar tweaks" : "Tweaks"}
      </button>
    </div>
  );
}
