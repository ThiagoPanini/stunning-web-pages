import { STEPS, StepIcon } from "./cycle-steps";
import { GifSpace } from "./gif-space";

// Version 04 of the cycle: the space of a GIF made elsewhere, with the four steps next to it, as a list
// that does not move.
export function CycleGif() {
  return (
    <div className="reveal-2 flex flex-wrap items-center gap-x-gif-gap gap-y-8">
      <GifSpace
        label="Espaço reservado para o GIF do ciclo integrado, proporção 16:9"
        lines={["Inserir GIF · Ciclo integrado", "16:9 · 1280 × 720 · em loop"]}
        className="min-w-0 max-w-170 shrink grow-(--grow-130) basis-110"
      />
      <ol className="flex min-w-0 shrink grow basis-85 flex-col border-rule border-b">
        {STEPS.map((step, i) => (
          <li key={step.name} className="flex items-center gap-4 border-rule border-t py-3.5">
            <span
              aria-hidden="true"
              className="grid size-10 flex-none place-items-center rounded-circle bg-rule text-muted"
            >
              <StepIcon step={i} size={20} gesture={false} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="font-normal text-17 leading-130 tracking-tight-10">{step.name}</h3>
              <p className="text-14 text-muted leading-145">{step.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
