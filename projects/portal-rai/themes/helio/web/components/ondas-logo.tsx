"use client";

import { useEffect, useState } from "react";

// The Ondas logo, the portal's logo: a conversational agent in the middle, drawn as a turning sphere of
// characters, and a ring of guardrails around it. Attacks come from outside as red wave fronts and break
// on the ring; the agent's answers leave as waves: the valid ones, in grey, cross the ring, and the
// invalid ones, in red, are stopped from inside.
//
// A grid of 64 by 32 characters in four layers (agent, guardrails, what is stopped and what passes),
// ported line by line from the logo board's script: the same order of operations and the same 32-bit
// geometry, so the same frame draws the same characters. A frame is a pure function of its number, and
// the number comes from time (85 ms per frame), never from a counter or a random draw.
//
// It imports nothing but React; its colors and type are the design system's tokens, as Tailwind classes.
// A theme that copies this file changes only the background it passes.

type OndasLogoProps = {
  // Any CSS color behind the characters. The board's default is its own night.
  background?: string;
  // Off, the logo stays on its starting frame. Reduced motion has the same effect.
  animated?: boolean;
  // The starting frame; 0 picks the resting frame, the one that tells the whole story at once.
  frame?: number;
};

const MS_PER_FRAME = 85;
const RESTING_FRAME = 12845;

const COLS = 64;
const ROWS = 32;
const CELLS = COLS * ROWS;
const TAU = Math.PI * 2;

// The grid's geometry, computed once: for each cell, its offset from the center (a cell is half as wide
// as it is tall), its distance and angle, and half its thickness along the radius.
const grid = (() => {
  const D = new Float32Array(CELLS);
  const TH = new Float32Array(CELLS);
  const T = new Float32Array(CELLS);
  const DX = new Float32Array(CELLS);
  const DY = new Float32Array(CELLS);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * COLS + c;
      const dx = (c + 0.5 - COLS / 2) / 2;
      const dy = r + 0.5 - ROWS / 2;
      const d = Math.sqrt(dx * dx + dy * dy);
      DX[i] = dx;
      DY[i] = dy;
      D[i] = d;
      TH[i] = Math.atan2(dy, dx);
      T[i] = 0.5 * (Math.abs(dx / d) * 0.5 + Math.abs(dy / d));
    }
  }
  return { D, TH, T, DX, DY };
})();

// Radii: the sphere, the ring, where attacks start, where they hit the ring from outside, where answers
// start, where invalid answers hit it from inside, and where valid answers end.
const RS = 8.4;
const RP = 12.6;
const RO = 21.5;
const RC = RP + 1.15;
const R0 = RS + 0.9;
const RB = RP - 1.15;
const REND = 21.5;
// Half widths of the wave fronts, in radians: attacks and answers.
const WA = 0.3;
const WV = 0.26;

const adist = (p: number, q: number) => Math.abs(((p - q + Math.PI * 3) % TAU) - Math.PI);

// Kinds of wave: a is an attack, v a valid answer, x an invalid answer.
type Kind = "a" | "v" | "x";
type Span = [number, number];
// For each kind, in which fraction of its life the wave takes the outside (o), the inside (i) and the
// ring (n), and its half width.
type Zones = { o?: Span; i?: Span; n?: Span; w: number };
const Z: Record<Kind, Zones> = {
  a: { o: [0, 1], n: [0.66, 0.96], w: WA },
  v: { i: [0, 0.4], o: [0.27, 1], n: [0.17, 0.51], w: WV },
  x: { i: [0, 1], n: [0.56, 1], w: WV },
};
const ZONE_KEYS = ["o", "i", "n"] as const;

// Lanes: each fires one wave per period, shifted by its phase, and the wave lives for `life` of the
// period. Periods are coprime.
type Lane = { t: Kind; per: number; ph: number; life: number };
const LANES: Lane[] = [
  { t: "v", per: 89, ph: 12, life: 0.94 },
  { t: "v", per: 103, ph: 71, life: 0.94 },
  { t: "x", per: 113, ph: 64, life: 0.4 },
  { t: "a", per: 61, ph: 7, life: 0.92 },
  { t: "a", per: 71, ph: 29, life: 0.92 },
  { t: "a", per: 83, ph: 50, life: 0.92 },
];

// Whether two waves, starting on frames A0 and B0, take the outside, the inside or the ring at the same
// time.
function overlaps(S1: Lane, A0: number, S2: Lane, B0: number): boolean {
  const z1 = Z[S1.t];
  const z2 = Z[S2.t];
  const l1 = S1.per * S1.life;
  const l2 = S2.per * S2.life;
  for (const key of ZONE_KEYS) {
    const u1 = z1[key];
    const u2 = z2[key];
    if (u1 && u2 && A0 + u1[0] * l1 < B0 + u2[1] * l2 && B0 + u2[0] * l2 < A0 + u1[1] * l1) {
      return true;
    }
  }
  return false;
}

// The angle of each wave depends on nothing but its lane and cycle, so it is kept across frames, and
// cleared now and then so it does not grow forever.
const angles = new Map<string, number | null>();
const ANGLES_KEPT = 800;

// The angle of each wave in each cycle: the first candidate of a fixed sequence with a whole clearance
// from the waves of earlier lanes that share with it, at the same time, the outside, the inside or the
// ring. With no clearance, the cycle is skipped.
function angle(j: number, k: number): number | null {
  const key = `${j}|${k}`;
  const known = angles.get(key);
  if (known !== undefined) return known;
  const S = LANES[j];
  const F0 = k * S.per - S.ph;
  const F1 = F0 + S.per * S.life;
  const taken: [number, number][] = [];
  for (let i = 0; i < j; i++) {
    const S2 = LANES[i];
    const k1 = Math.floor((F0 + S2.ph) / S2.per);
    const k2 = Math.floor((F1 + S2.ph) / S2.per);
    for (let u = k1; u <= k2; u++) {
      const G0 = u * S2.per - S2.ph;
      if (!overlaps(S, F0, S2, G0)) continue;
      const t2 = angle(i, u);
      if (t2 !== null) taken.push([t2, Z[S.t].w + Z[S2.t].w + 0.1]);
    }
  }
  let best: number | null = null;
  let clearance = -1;
  for (let m = 0; m < 48; m++) {
    const th = ((((j * 0.618 + k * 0.381 + 0.25 + m * 0.2764) % 1) + 1) % 1) * TAU;
    let cl = 9;
    for (let u = 0; u < taken.length && cl > clearance; u++) {
      cl = Math.min(cl, adist(th, taken[u][0]) / taken[u][1]);
    }
    if (cl > clearance) {
      clearance = cl;
      best = th;
    }
    if (clearance >= 1.15) break;
  }
  const out = clearance >= 1 ? best : null;
  angles.set(key, out);
  return out;
}

// A wave on screen: its kind, how far along its life (p), its angle and radius, its half width, and what
// it does to the ring: blk is the half width it blocks after the hit, run how far the two sweeps that
// follow the hit have gone, thin whether a valid answer is crossing the ring.
type Wave = {
  t: Kind;
  p: number;
  th: number;
  r: number;
  w: number;
  hit: boolean;
  blk: number;
  run: number;
  thin: boolean;
};

// The four layers of a frame, one string each, 32 lines of 64 characters.
type Layers = { w: string; b: string; r: string; g: string };

// Draws a frame. Layers: w is the agent, b the guardrails, r what has to be stopped, g what may pass.
// Nothing travels as a strip: everything is a wave front (an arc across its path), with two echoes behind.
function drawFrame(f: number): Layers {
  const G = grid;
  if (angles.size > ANGLES_KEPT) angles.clear();

  const ev: Wave[] = [];
  for (let j = 0; j < LANES.length; j++) {
    const S = LANES[j];
    const kk = Math.floor((f + S.ph) / S.per);
    const q = ((f + S.ph) % S.per) / S.per;
    if (q > S.life) continue;
    const th0 = angle(j, kk);
    if (th0 === null) continue;
    const e: Wave = {
      t: S.t,
      p: q / S.life,
      th: th0,
      r: 0,
      w: 0,
      hit: false,
      blk: 0,
      run: 0,
      thin: false,
    };
    if (S.t === "a") {
      // Comes from outside (p < 0.66), breaks on the ring and comes apart.
      e.hit = e.p >= 0.66;
      e.r = e.hit ? RC : RO - (RO - RC) * (e.p / 0.66);
      e.w = WA;
      e.blk = e.hit
        ? e.p < 0.8
          ? Math.min(WA * 0.6, 0.05 + (e.p - 0.66) * 1.6)
          : Math.max(0, WA * 0.6 * (1 - (e.p - 0.8) / 0.06))
        : 0;
      e.run = e.p >= 0.8 ? WA * 0.6 + (e.p - 0.8) * 2.6 : 0;
    } else if (S.t === "v") {
      e.r = R0 + (REND - R0) * e.p;
      e.w = WV;
      e.thin = e.r >= RP - 1.2 && e.r <= RP + 2.9;
    } else {
      e.hit = e.p >= 0.56;
      e.r = e.hit ? RB : R0 + (RB - R0) * (e.p / 0.56);
      e.w = WV;
      e.blk = e.hit
        ? e.p < 0.8
          ? Math.min(WV * 0.6, 0.05 + (e.p - 0.56) * 1.4)
          : Math.max(0, WV * 0.6 * (1 - (e.p - 0.8) / 0.08))
        : 0;
      e.run = e.p >= 0.8 ? WV * 0.6 + (e.p - 0.8) * 1.6 : 0;
    }
    ev.push(e);
  }

  const W: string[] = new Array(CELLS).fill(" ");
  const B: string[] = new Array(CELLS).fill(" ");
  const R: string[] = new Array(CELLS).fill(" ");
  const Gy: string[] = new Array(CELLS).fill(" ");
  const rot = f * 0.045;
  const ct = Math.cos(-0.5);
  const sn = Math.sin(-0.5);
  const ramp = ".,:;;==+*";
  for (let i = 0; i < CELLS; i++) {
    const d = G.D[i];
    if (d <= RS) {
      // The agent: a sphere lit from the top left, with bands that turn.
      const nx = G.DX[i] / RS;
      const ny = G.DY[i] / RS;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      const x1 = nx * ct - ny * sn;
      const y1 = nx * sn + ny * ct;
      const lon = Math.atan2(x1, nz) + rot;
      const lat = Math.asin(Math.max(-1, Math.min(1, y1)));
      const v = Math.sin(lon * 3 + lat * 2.4);
      if (v > -0.15) {
        const light = nx * -0.45 + ny * -0.55 + nz * 0.7;
        const lum = Math.max(0, Math.min(0.999, 0.18 + 0.82 * light + 0.12 * v));
        W[i] = ramp.charAt(Math.floor(lum * ramp.length));
      }
    } else if (Math.abs(d - RP) < G.T[i]) {
      // The ring of guardrails.
      const th = G.TH[i];
      let ch = "";
      for (let j = 0; j < ev.length && !ch; j++) {
        if (ev[j].t === "v" && ev[j].thin && adist(th, ev[j].th) < ev[j].w + 0.02) ch = "·";
      }
      for (let j = 0; j < ev.length && !ch; j++) {
        const da2 = adist(th, ev[j].th);
        if (ev[j].blk > 0 && da2 < ev[j].blk) ch = "#";
        // After the hit, two short sweeps run along the ring, one each way.
        else if (ev[j].run > 0 && Math.abs(da2 - ev[j].run) < 0.05) ch = "=";
      }
      if (!ch) {
        const sweep = (((th - f * 0.035) % TAU) + TAU) % TAU;
        ch = sweep < 0.9 ? "=" : ":";
      }
      B[i] = ch;
    }
  }

  // Fronts first, echoes after: a cell takes one character, in one layer.
  const arc = (
    M: string[],
    e2: Wave,
    rad: number,
    half: number,
    core: string,
    edge: string,
  ): void => {
    if (rad <= RS + 0.55) return;
    for (let c2 = 0; c2 < CELLS; c2++) {
      if (Math.abs(G.D[c2] - rad) >= G.T[c2] || G.D[c2] <= RS) continue;
      const da = adist(G.TH[c2], e2.th);
      if (da >= half) continue;
      if (B[c2] !== " " || R[c2] !== " " || Gy[c2] !== " ") continue;
      M[c2] = da < e2.w * 0.42 ? core : edge;
    }
  };
  for (const e of ev) {
    if (e.t === "a") {
      if (!e.hit) arc(R, e, e.r, e.w, "×", "·");
      else if (e.p < 0.82) arc(R, e, e.r, e.w * 0.46 * (1 - (e.p - 0.66) * 4), "+", "+");
    } else if (e.t === "v") {
      if (e.r <= 20.5) arc(Gy, e, e.r, e.w, e.r <= 17 ? "o" : "·", "·");
    } else {
      if (!e.hit) arc(R, e, e.r, e.w, "ø", "·");
      else if (e.p < 0.78) arc(R, e, e.r, e.w * 0.46 * (1 - (e.p - 0.56) * 3), "+", "+");
    }
  }
  for (const e of ev) {
    if (e.t === "a" && !e.hit) {
      arc(R, e, e.r + 1.55, e.w, "·", "·");
      arc(R, e, e.r + 3.1, e.w, "·", "·");
    } else if (e.t === "v" && e.r <= 19) {
      arc(Gy, e, e.r - 1.55, e.w, "·", "·");
      arc(Gy, e, e.r - 3.1, e.w, "·", "·");
    } else if (e.t === "x" && !e.hit) {
      arc(R, e, e.r - 1.55, e.w, "·", "·");
    }
  }

  const join = (m: string[]) => {
    const lines: string[] = [];
    for (let r2 = 0; r2 < ROWS; r2++) lines.push(m.slice(r2 * COLS, r2 * COLS + COLS).join(""));
    return lines.join("\n");
  };
  return { w: join(W), b: join(B), r: join(R), g: join(Gy) };
}

// The layers in the board's order, bottom to top, each in its color.
const LAYERS: { key: keyof Layers; color: string }[] = [
  { key: "w", color: "text-logo-agent" },
  { key: "b", color: "text-logo-blue" },
  { key: "r", color: "text-logo-red" },
  { key: "g", color: "text-logo-gray" },
];

// The frame on screen: the starting one, or, while the logo runs, the starting one plus the whole frames
// since it started running. Reduced motion stops it on the starting frame, and the logo starts and stops
// again as the preference changes.
function useFrame(start: number, animated: boolean): number {
  const [frame, setFrame] = useState(start);
  useEffect(() => {
    setFrame(start);
    if (!animated) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let request = 0;
    const run = () => {
      cancelAnimationFrame(request);
      setFrame(start);
      if (reducedMotion.matches) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        // Whole frames: the page draws again only when the frame changes.
        setFrame(Math.floor(start + Math.max(0, now - t0) / MS_PER_FRAME));
        request = requestAnimationFrame(tick);
      };
      request = requestAnimationFrame(tick);
    };
    run();
    reducedMotion.addEventListener("change", run);
    return () => {
      reducedMotion.removeEventListener("change", run);
      cancelAnimationFrame(request);
    };
  }, [start, animated]);
  return Math.floor(animated ? frame : start);
}

export function OndasLogo({ background, animated = true, frame = 0 }: OndasLogoProps) {
  const start = Number.isFinite(frame) && frame > 0 ? frame : RESTING_FRAME;
  const layers = drawFrame(useFrame(start, animated));
  return (
    <div
      role="img"
      aria-label="Logo em caracteres, versão Ondas: um agente conversacional no centro e um anel de guardrails ao redor. Ataques chegam de fora como frentes de onda vermelhas e quebram no anel; as respostas do agente saem como ondas: as válidas, em cinza, atravessam o anel, e as inválidas, em vermelho, são barradas por dentro."
      className="@container relative aspect-square w-full overflow-hidden bg-logo-night font-logo text-logo-bright"
      style={background ? { background } : undefined}
    >
      {LAYERS.map(({ key, color }) => (
        <div
          key={key}
          aria-hidden="true"
          className={`absolute top-0 left-1/2 -translate-x-1/2 whitespace-pre text-logo leading-1200 ${color}`}
        >
          {layers[key]}
        </div>
      ))}
    </div>
  );
}
