"use client";

import { useEffect, useState } from "react";

// The Ondas mini, the brand mark of the header: the Ondas logo's scene at 38px. The agent turns in the
// middle, inside the ring of guardrails; attacks come from outside as red dots and stop at the ring; the
// valid answers, grey dots, cross it, and the invalid ones, red dots, are stopped from inside.
//
// Ported line by line from the mini's board, which copies the logo's schedule of waves without changing
// a number: the same lanes, periods and clearance between waves, in the same unit (1 is the height of a
// character of the logo). What changes is the stroke: characters vanish at 36px, so the agent becomes
// lines and everything that travels becomes a dot, a stroke of almost zero length with a round cap. The
// frame shows 18.2 units each way (the logo shows 16). A frame is a pure function of its number, and the
// number comes from time (85 ms per frame), never from a counter or a random draw.
//
// It imports nothing but React; its colors are the design system's tokens, as Tailwind classes.

type OndasMiniProps = {
  // Any CSS color behind the drawing. The board's default is the page's night; the header passes
  // "transparent".
  background?: string;
  // Off, the mark stays on its starting frame. Reduced motion has the same effect.
  animated?: boolean;
  // The starting frame; 0 picks the resting frame, the logo's own.
  frame?: number;
};

const MS_PER_FRAME = 85;
const RESTING_FRAME = 12845;
const TAU = Math.PI * 2;

// Radii: the sphere, the ring, where attacks start, where they hit the ring from outside, where answers
// start, where invalid answers hit it from inside, and where valid answers end.
const RS = 8.4;
const RP = 12.6;
const RO = 21.5;
const RC = RP + 1.15;
const R0 = RS + 0.9;
const RB = RP - 1.15;
const REND = 21.5;
// Where a dot stops: against the ring, from outside and from inside.
const RCD = RP + 2.3;
const RBD = RP - 1.9;
// The step between the dots of the ring, the same as the dashes of its circle.
const STEP = 3.299 / RP;
// Half widths of the waves, in radians: attacks and answers.
const WA = 0.3;
const WV = 0.26;

const adist = (p: number, q: number) => Math.abs(((p - q + Math.PI * 3) % TAU) - Math.PI);

// Kinds of wave: a is an attack, v a valid answer, x an invalid answer.
type Kind = "a" | "v" | "x";
type Span = [number, number];
type Zones = { o?: Span; i?: Span; n?: Span; w: number };
const Z: Record<Kind, Zones> = {
  a: { o: [0, 1], n: [0.66, 0.96], w: WA },
  v: { i: [0, 0.4], o: [0.27, 1], n: [0.17, 0.51], w: WV },
  x: { i: [0, 1], n: [0.56, 1], w: WV },
};
const ZONE_KEYS = ["o", "i", "n"] as const;

type Lane = { t: Kind; per: number; ph: number; life: number };
const LANES: Lane[] = [
  { t: "v", per: 89, ph: 12, life: 0.94 },
  { t: "v", per: 103, ph: 71, life: 0.94 },
  { t: "x", per: 113, ph: 64, life: 0.4 },
  { t: "a", per: 61, ph: 7, life: 0.92 },
  { t: "a", per: 71, ph: 29, life: 0.92 },
  { t: "a", per: 83, ph: 50, life: 0.92 },
];

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

type Wave = { t: Kind; p: number; th: number; r: number; hit: boolean; blk: number; run: number };

function events(f: number): Wave[] {
  if (angles.size > ANGLES_KEPT) angles.clear();
  const ev: Wave[] = [];
  for (let j = 0; j < LANES.length; j++) {
    const S = LANES[j];
    const kk = Math.floor((f + S.ph) / S.per);
    const q = ((f + S.ph) % S.per) / S.per;
    if (q > S.life) continue;
    const th0 = angle(j, kk);
    if (th0 === null) continue;
    const e: Wave = { t: S.t, p: q / S.life, th: th0, r: 0, hit: false, blk: 0, run: 0 };
    if (S.t === "a") {
      e.hit = e.p >= 0.66;
      e.r = e.hit ? RC : RO - (RO - RC) * (e.p / 0.66);
      e.blk = e.hit
        ? e.p < 0.8
          ? Math.min(WA * 0.6, 0.05 + (e.p - 0.66) * 1.6)
          : Math.max(0, WA * 0.6 * (1 - (e.p - 0.8) / 0.06))
        : 0;
      e.run = e.p >= 0.8 ? WA * 0.6 + (e.p - 0.8) * 2.6 : 0;
    } else if (S.t === "v") {
      e.r = R0 + (REND - R0) * e.p;
    } else {
      e.hit = e.p >= 0.56;
      e.r = e.hit ? RB : R0 + (RB - R0) * (e.p / 0.56);
      e.blk = e.hit
        ? e.p < 0.8
          ? Math.min(WV * 0.6, 0.05 + (e.p - 0.56) * 1.4)
          : Math.max(0, WV * 0.6 * (1 - (e.p - 0.8) / 0.08))
        : 0;
      e.run = e.p >= 0.8 ? WV * 0.6 + (e.p - 0.8) * 1.6 : 0;
    }
    ev.push(e);
  }
  return ev;
}

// The agent: the logo's turning bands (the same formula, the same light), as lines one unit tall, one
// per row of characters, in three levels of brightness instead of the logo's nine characters.
function agent(f: number): [string, string, string] {
  const rot = f * 0.045;
  const ct = Math.cos(-0.5);
  const sn = Math.sin(-0.5);
  const d: [string, string, string] = ["", "", ""];
  for (let r = 0; r < 32; r++) {
    const dy = r + 0.5 - 16;
    if (Math.abs(dy) > RS) continue;
    let run = -1;
    let x0 = 0;
    let x1 = 0;
    for (let c = 0; c <= 64; c++) {
      let tier = -1;
      if (c < 64) {
        const dx = (c + 0.5 - 32) / 2;
        if (dx * dx + dy * dy <= RS * RS) {
          const nx = dx / RS;
          const ny = dy / RS;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          const X = nx * ct - ny * sn;
          const Y = nx * sn + ny * ct;
          const lon = Math.atan2(X, nz) + rot;
          const lat = Math.asin(Math.max(-1, Math.min(1, Y)));
          const v = Math.sin(lon * 3 + lat * 2.4);
          if (v > -0.15) {
            const light = nx * -0.45 + ny * -0.55 + nz * 0.7;
            const lum = Math.max(0, Math.min(0.999, 0.18 + 0.82 * light + 0.12 * v));
            tier = lum < 0.34 ? 2 : lum < 0.67 ? 1 : 0;
          }
        }
      }
      if (tier !== run) {
        if (run >= 0) d[run] += `M${x0} ${dy}H${x1}`;
        run = tier;
        if (tier >= 0) x0 = (c - 32) / 2;
      }
      if (tier >= 0) x1 = (c + 1 - 32) / 2;
    }
  }
  return d;
}

type Strokes = Record<
  "a1" | "a2" | "a3" | "sw" | "r1" | "r2" | "r3" | "x1" | "g1" | "g2" | "g3" | "bk" | "rn",
  string
>;

const arc = (r: number, th: number, half: number) => {
  const a0 = th - half;
  const a1 = th + half;
  return `M${(r * Math.cos(a0)).toFixed(2)} ${(r * Math.sin(a0)).toFixed(2)}A${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${(r * Math.cos(a1)).toFixed(2)} ${(r * Math.sin(a1)).toFixed(2)}`;
};
const dot = (r: number, th: number) =>
  `M${(r * Math.cos(th)).toFixed(2)} ${(r * Math.sin(th)).toFixed(2)}h.01`;
// No dot is drawn over the agent.
const free = (r: number) => r > RS + 0.55;
// The ring's own dots less than `half` from the angle of the hit: they swell when something is blocked.
const swell = (th: number, half: number) => {
  let s = "";
  for (let n = 0; n < 24; n++) if (adist(n * STEP, th) < half) s += dot(RP, n * STEP);
  return s;
};

// The strokes of a frame: three levels of the agent, the sweep of the ring and the dots (r and x are
// stopped, g passes).
function drawFrame(f: number): Strokes {
  const ev = events(f);
  const ag = agent(f);
  let r1 = "";
  let r2 = "";
  let r3 = "";
  let x1 = "";
  let g1 = "";
  let g2 = "";
  let g3 = "";
  let bk = "";
  let rn = "";
  for (const e of ev) {
    if (e.t === "a") {
      // Comes from outside: the thick dot ahead and two smaller ones behind; once against the ring, it
      // shrinks until it is gone.
      if (!e.hit) {
        const r = RCD + ((e.r - RC) * (RO - RCD)) / (RO - RC);
        r1 += dot(r, e.th);
        r2 += dot(r + 2.7, e.th);
        r3 += dot(r + 4.6, e.th);
      } else if (e.p < 0.82) {
        const k = (e.p - 0.66) / 0.16;
        if (k < 0.35) r1 += dot(RCD, e.th);
        else if (k < 0.7) r2 += dot(RCD, e.th);
        else r3 += dot(RCD, e.th);
      }
    } else if (e.t === "v") {
      // Leaves the agent and crosses the ring: strong up to 17, fainter from there until it is gone.
      if (e.r <= 17) g1 += dot(e.r, e.th);
      else if (e.r <= 20.5) g2 += dot(e.r, e.th);
      if (e.r <= 19) {
        if (free(e.r - 2.5)) g2 += dot(e.r - 2.5, e.th);
        if (free(e.r - 4.3)) g3 += dot(e.r - 4.3, e.th);
      }
    } else {
      // Leaves the agent and is stopped inside the ring.
      if (!e.hit) x1 += dot(R0 + ((e.r - R0) * (RBD - R0)) / (RB - R0), e.th);
      else if (e.p < 0.78) {
        const k = (e.p - 0.56) / 0.22;
        if (k < 0.35) x1 += dot(RBD, e.th);
        else if (k < 0.7) r2 += dot(RBD, e.th);
        else r3 += dot(RBD, e.th);
      }
    }
    // The block swells the ring's dots nearest the hit, and then two dots run along the ring, one each
    // way.
    if (e.blk > 0) bk += swell(e.th, e.blk + 0.05);
    if (e.run > 0) rn += dot(RP, e.th + e.run) + dot(RP, e.th - e.run);
  }
  return {
    a1: ag[0],
    a2: ag[1],
    a3: ag[2],
    sw: arc(RP, f * 0.035 + 0.45, 0.45),
    r1,
    r2,
    r3,
    x1,
    g1,
    g2,
    g3,
    bk,
    rn,
  };
}

// The frame on screen: the starting one, or, while the mark runs, the starting one plus the whole frames
// since it started running. Reduced motion stops it on the starting frame, and the mark starts and stops
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

export function OndasMini({ background, animated = true, frame = 0 }: OndasMiniProps) {
  const start = Number.isFinite(frame) && frame > 0 ? frame : RESTING_FRAME;
  const d = drawFrame(useFrame(start, animated));
  return (
    <div
      role="img"
      aria-label="Logo Ondas em tamanho reduzido: o agente gira no centro, dentro do anel de guardrails. Ataques chegam de fora como pontos vermelhos e param no anel; as respostas válidas, pontos cinza, atravessam, e as inválidas, pontos vermelhos, são barradas por dentro."
      className="relative aspect-square w-full overflow-hidden bg-night"
      style={background ? { background } : undefined}
    >
      <svg
        aria-hidden="true"
        viewBox="-18.2 -18.2 36.4 36.4"
        fill="none"
        className="absolute top-0 left-0 block size-full"
      >
        <path d={d.a3} className="stroke-logo-agent" strokeWidth="0.82" opacity="0.36" />
        <path d={d.a2} className="stroke-logo-agent" strokeWidth="0.82" opacity="0.66" />
        <path d={d.a1} className="stroke-logo-agent" strokeWidth="0.82" />
        <circle
          cx="0"
          cy="0"
          r="12.6"
          className="stroke-logo-blue"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeDasharray="0.01 3.289"
          opacity="0.78"
        />
        <path d={d.sw} className="stroke-logo-blue" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d={d.g3}
          className="stroke-logo-gray"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d={d.g2}
          className="stroke-logo-gray"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path d={d.g1} className="stroke-logo-gray" strokeWidth="2.3" strokeLinecap="round" />
        <path
          d={d.r3}
          className="stroke-logo-red"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d={d.r2}
          className="stroke-logo-red"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path d={d.x1} className="stroke-logo-red" strokeWidth="2" strokeLinecap="round" />
        <path d={d.r1} className="stroke-logo-red" strokeWidth="2.6" strokeLinecap="round" />
        <path d={d.bk} className="stroke-logo-blue" strokeWidth="2.7" strokeLinecap="round" />
        <path d={d.rn} className="stroke-logo-blue" strokeWidth="2.1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
