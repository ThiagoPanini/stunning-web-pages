"use client";

import { useEffect, useState } from "react";

// The Eclusa logo, the Hélio's only logo: a disc in the middle is the conversational agent, and a ring of
// 24 blue segments is the guardrail perimeter. Attacks (red crosses) come from outside; the segments arm,
// take the hit, and the cross breaks into two strokes. Valid answers (grey rings) leave through a door the
// segments open; invalid ones (slashed red rings) are stopped from inside.
//
// The drawing is a pure function of the frame, ported from the Quadro's logic: the same frame always draws
// the same image. The frame comes from time (85 ms per frame), never from a counter or a random draw.
// It imports nothing from the app; its colors are the Sistema de design's tokens, as Tailwind classes.

type EclusaLogoProps = {
  // Any CSS color for the square behind the drawing. The Quadro's default is the page's night.
  background?: string;
  // Off, the logo stays on its starting frame. Reduced motion has the same effect.
  animated?: boolean;
  // The starting frame; 0 picks the resting frame, the one that tells the whole story at once.
  frame?: number;
};

const MS_PER_FRAME = 85;
const RESTING_FRAME = 55435;

// Ring: 24 segments of radius 30 and width 3.4, around a disc of radius 10.8, in a 100 by 100 box.
const SEGMENTS = 24;
const STEP = 360 / SEGMENTS;
const RING_RADIUS = 30;
const SEGMENT_WIDTH = 3.4;
const DISC_RADIUS = 10.8;
const RAD = Math.PI / 180;

// Frames until contact: attack, valid answer (at the door), invalid answer.
const TO_CONTACT = { a: 24, v: 21, x: 15 } as const;

type LaneKind = keyof typeof TO_CONTACT;

// Lanes of events: v is a valid answer, x an invalid answer, a an attack. Each lane fires once per
// period, shifted by its phase, and each event lives for `life` frames.
const LANES: { t: LaneKind; per: number; ph: number; life: number }[] = [
  { t: "v", per: 67, ph: 12, life: 64 },
  { t: "v", per: 79, ph: 55, life: 64 },
  { t: "v", per: 97, ph: 71, life: 64 },
  { t: "x", per: 113, ph: 64, life: 32 },
  { t: "a", per: 43, ph: 7, life: 44 },
  { t: "a", per: 53, ph: 29, life: 44 },
  { t: "a", per: 61, ph: 50, life: 44 },
  { t: "a", per: 71, ph: 20, life: 44 },
];

type LaneEvent = { t: LaneKind; F0: number; th: number; kf: number };

const mod = (a: number, n: number) => ((a % n) + n) % n;
// Signed difference between two angles, in degrees.
const angleDiff = (p: number, q: number) => mod(p - q + 180, 360) - 180;
// The ring turns slowly: a quarter of a degree per frame.
const ringTurn = (frame: number) => frame * 0.25;
const smoothstep = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// The plan of each lane and cycle depends on nothing but the two numbers, so it is kept across frames,
// cleared now and then so it does not grow forever.
const plans = new Map<string, LaneEvent | null>();
const PLANS_KEPT = 900;

// The angle of each event in each cycle: the first of a fixed sequence that keeps 38 degrees or more from
// every earlier lane's event on screen at the same time. A valid answer aims at the gap between two
// segments (the door); an attack and an invalid answer aim at the middle of a segment. With no free
// angle, the cycle is skipped.
function plan(j: number, k: number): LaneEvent | null {
  const key = `${j}|${k}`;
  const known = plans.get(key);
  if (known !== undefined) return known;
  const lane = LANES[j];
  const F0 = k * lane.per - lane.ph;
  const kf = F0 + TO_CONTACT[lane.t];
  const taken: number[] = [];
  for (let i = 0; i < j; i++) {
    const other = LANES[i];
    const k1 = Math.floor((F0 + other.ph) / other.per) - 1;
    const k2 = Math.floor((F0 + lane.life + other.ph) / other.per);
    for (let u = k1; u <= k2; u++) {
      const earlier = plan(i, u);
      if (earlier && earlier.F0 < F0 + lane.life && F0 < earlier.F0 + other.life) {
        taken.push(earlier.th);
      }
    }
  }
  let found: LaneEvent | null = null;
  for (let m = 0; m < SEGMENTS && !found; m++) {
    const th = mod(
      (mod(j * 7 + k * 5 + m * 11, SEGMENTS) + (lane.t === "v" ? 0.5 : 0)) * STEP + ringTurn(kf),
      360,
    );
    if (taken.every((other) => Math.abs(angleDiff(th, other)) >= 38)) {
      found = { t: lane.t, F0, th, kf };
    }
  }
  plans.set(key, found);
  return found;
}

// The SVG values of each mark, as the strings the drawing writes.
type Spot = { x: string; y: string; op: string };
type Stroke = Spot & { rot: string; da: string; off: string };
type Arc = { k: string; w: string; dash: string; rot: string; op: string };
type Heat = "cold" | "warm" | "hot";
type Segment = Arc & { heat: Heat };

type Scene = {
  segs: Segment[];
  waves: Arc[];
  rings: Spot[];
  slashed: Spot[];
  crosses: Spot[];
  dashesIn: Stroke[];
  dashesOut: Stroke[];
  discK: string;
};

type Act = { k: LaneKind; th: number; tc: number };

// The scene of a frame (which may be fractional), in units from 0 to 100.
function scene(f: number): Scene {
  if (plans.size > PLANS_KEPT) plans.clear();
  const events: LaneEvent[] = [];
  for (let j = 0; j < LANES.length; j++) {
    const kk = Math.floor((f + LANES[j].ph) / LANES[j].per);
    for (let q = kk - 1; q <= kk; q++) {
      const e = plan(j, q);
      if (e && f >= e.F0 && f < e.F0 + LANES[j].life) events.push(e);
    }
  }

  const at = (r: number, a: number, op: number): Spot => ({
    x: (50 + r * Math.cos(a * RAD)).toFixed(2),
    y: (50 + r * Math.sin(a * RAD)).toFixed(2),
    op: Math.max(0, Math.min(1, op)).toFixed(3),
  });
  // A stroke tangent to the ring, `half` long on each side: one dash on a line from -3 to 3 (the round
  // cap adds half the stroke width at each end).
  const dash = (list: Stroke[], r: number, a: number, half: number, op: number) => {
    if (op <= 0.02 || half <= 0.05) return;
    const length = Math.max(0.01, 2 * half - 1.25);
    list.push({
      ...at(r, a, op),
      rot: (a + 90).toFixed(2),
      da: `${length.toFixed(2)} 100`,
      off: (length / 2 - 3).toFixed(2),
    });
  };
  // A thin arc centred on the angle a: the radius-30 circle scaled to the radius r, with a single dash.
  const arc = (list: Arc[], r: number, a: number, half: number, w: number, op: number) => {
    if (op <= 0.02) return;
    const k = r / 30;
    list.push({
      k: k.toFixed(4),
      w: (w / k).toFixed(3),
      dash: `${(30 * 2 * half * RAD).toFixed(2)} 400`,
      rot: (a - half).toFixed(2),
      op: Math.min(1, op).toFixed(3),
    });
  };

  const rings: Spot[] = [];
  const slashed: Spot[] = [];
  const crosses: Spot[] = [];
  const dashesIn: Stroke[] = [];
  const dashesOut: Stroke[] = [];
  const waves: Arc[] = [];
  const acts: Act[] = [];
  let disc = DISC_RADIUS;

  for (const e of events) {
    const t = f - e.F0;
    if (e.t === "a") {
      // Attack: a cross that comes straight from outside; on contact it breaks into two strokes that
      // slide along the ring.
      const tc = t - TO_CONTACT.a;
      const rc = RING_RADIUS + SEGMENT_WIDTH / 2 + 3.3;
      if (tc < 0) crosses.push(at(rc + 1.5 * -tc, e.th, t / 4));
      else if (tc < 16) {
        const sl = 17 * (1 - Math.exp(-tc / 5));
        const fade = 1 - (tc / 16) * (tc / 16);
        dash(dashesOut, rc - 0.9 + tc * 0.07, e.th + sl, 2.5 * (1 - tc / 20), fade);
        dash(dashesOut, rc - 0.9 + tc * 0.07, e.th - sl, 2.5 * (1 - tc / 20), fade);
        arc(waves, rc + 0.6 + tc * 0.62, e.th, 15 - tc * 0.35, 0.55, 0.8 * (1 - tc / 16));
      }
      acts.push({ k: "a", th: e.th, tc });
    } else if (e.t === "v") {
      // Valid answer: leaves from behind the disc, goes through the door and on.
      const rv = 8 + 1.05 * t;
      rings.push(at(rv, e.th, (75 - rv) / 8));
      acts.push({ k: "v", th: e.th, tc: t - TO_CONTACT.v });
      if (t < 10) disc = Math.max(disc, DISC_RADIUS + 0.6 * Math.exp(-t / 3.5));
    } else {
      // Invalid answer: leaves from behind the disc and is stopped from inside the ring.
      const tx = t - TO_CONTACT.x;
      const rin = RING_RADIUS - SEGMENT_WIDTH / 2 - 3.1;
      if (tx < 0) slashed.push(at(8 + (rin - 8) * (t / TO_CONTACT.x), e.th, 1));
      else if (tx < 16) {
        const sl2 = 15 * (1 - Math.exp(-tx / 5));
        const fade2 = 1 - (tx / 16) * (tx / 16);
        dash(dashesIn, rin + 0.9 - tx * 0.05, e.th + sl2, 2.5 * (1 - tx / 20), fade2);
        dash(dashesIn, rin + 0.9 - tx * 0.05, e.th - sl2, 2.5 * (1 - tx / 20), fade2);
        arc(waves, rin - 0.4 - tx * 0.4, e.th, 15 - tx * 0.35, 0.55, 0.8 * (1 - tx / 16));
      }
      acts.push({ k: "x", th: e.th, tc: tx });
      if (t < 10) disc = Math.max(disc, DISC_RADIUS + 0.6 * Math.exp(-t / 3.5));
    }
  }

  // Each segment adds up what the events ask of it: a step back or forward on the radius, a turn on the
  // angle, width and glow.
  const segs: Segment[] = [];
  for (let j = 0; j < SEGMENTS; j++) {
    const a0 = j * STEP + ringTurn(f);
    let dr = 0;
    let da = 0;
    let w = SEGMENT_WIDTH;
    let hot = 0;
    for (const act of acts) {
      const dd = angleDiff(a0, act.th);
      const near = Math.exp(-(dd / 13) * (dd / 13));
      const sgn = act.k === "x" ? -1 : 1;
      if (act.k === "v") {
        // Door: the segments move aside and thin out, then close, with a touch of spring.
        const op = smoothstep((act.tc + 9) / 7) * (1 - smoothstep((act.tc - 3) / 8));
        da += (dd >= 0 ? 1 : -1) * 8.4 * Math.exp(-Math.abs(dd) / 30) * op;
        w -= 0.9 * near * op;
      } else if (act.tc < 0) {
        // Arming: moves toward what comes and thickens.
        const br = smoothstep((act.tc + 10) / 10);
        dr += sgn * 1.5 * near * br;
        w += 1.5 * near * br;
      } else {
        // Impact: a damped spring and a glow that cools down.
        dr += sgn * 1.5 * near * Math.exp(-act.tc / 4.2) * Math.cos(act.tc * 0.85);
        w += 1.5 * near * Math.exp(-act.tc / 6);
        hot = Math.max(hot, near * Math.exp(-act.tc / 5));
      }
    }
    const sweep = mod(a0 * RAD - f * 0.035, Math.PI * 2) < 0.9;
    const r = RING_RADIUS + dr;
    const half = STEP / 2 - 1.5;
    const ks = r / 30;
    segs.push({
      k: ks.toFixed(4),
      w: ((w + (sweep ? 0.5 : 0)) / ks).toFixed(3),
      dash: `${(30 * 2 * half * RAD).toFixed(2)} 400`,
      rot: (a0 + da - half).toFixed(2),
      heat: hot > 0.55 ? "hot" : hot > 0.22 ? "warm" : "cold",
      op: sweep || hot > 0.1 ? "1" : "0.8",
    });
  }
  return {
    segs,
    waves,
    rings,
    slashed,
    crosses,
    dashesIn,
    dashesOut,
    discK: (disc / DISC_RADIUS).toFixed(4),
  };
}

const SEGMENT_STROKE: Record<Heat, string> = {
  cold: "stroke-blue",
  warm: "stroke-blue-soft",
  hot: "stroke-blue-pale",
};

// The frame on screen: the starting one, or, while the logo runs, the starting one plus the time since
// it started running. Reduced motion stops it on the starting frame, and the logo starts and stops again
// as the preference changes.
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
        setFrame(start + Math.max(0, now - t0) / MS_PER_FRAME);
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
  return animated ? frame : start;
}

export function EclusaLogo({ background, animated = true, frame = 0 }: EclusaLogoProps) {
  const start = Number.isFinite(frame) && frame > 0 ? frame : RESTING_FRAME;
  const s = scene(useFrame(start, animated));
  return (
    <div
      role="img"
      aria-label="Logo geométrico, versão Eclusa: um disco no centro é o agente conversacional e um anel de segmentos azuis é o perímetro de guardrails. Ataques, cruzes vermelhas, chegam de fora; os segmentos se armam, recebem o impacto e a cruz se desfaz em dois traços. As respostas válidas, círculos cinza, saem por uma porta que os segmentos abrem; as inválidas, círculos vermelhos cortados, são barradas por dentro."
      className="relative aspect-square w-full overflow-hidden bg-night"
      style={background ? { background } : undefined}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        className="absolute top-0 left-0 block"
      >
        {s.rings.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
          <g key={i} style={{ transform: `translate(${m.x}px, ${m.y}px)`, opacity: m.op }}>
            <circle
              cx="0"
              cy="0"
              r="1.95"
              fill="none"
              strokeWidth="1.25"
              className="stroke-subtle"
            />
          </g>
        ))}
        {s.slashed.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
          <g key={i} style={{ transform: `translate(${m.x}px, ${m.y}px)`, opacity: m.op }}>
            <circle cx="0" cy="0" r="1.95" fill="none" strokeWidth="1.25" className="stroke-red" />
            <line
              x1="-2.45"
              y1="2.45"
              x2="2.45"
              y2="-2.45"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="stroke-red"
            />
          </g>
        ))}
        {s.dashesIn.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
          <BrokenStroke key={i} stroke={m} />
        ))}
        <g transform="translate(50 50)">
          <circle
            cx="0"
            cy="0"
            r="10.8"
            className="fill-disc"
            style={{ transform: `scale(${s.discK})` }}
          />
          {s.segs.map((seg, i) => (
            <circle
              // biome-ignore lint/suspicious/noArrayIndexKey: the 24 segments are the same 24 on every frame
              key={i}
              cx="0"
              cy="0"
              r="30"
              fill="none"
              className={SEGMENT_STROKE[seg.heat]}
              style={{
                transform: `rotate(${seg.rot}deg) scale(${seg.k})`,
                strokeWidth: seg.w,
                strokeDasharray: seg.dash,
                opacity: seg.op,
              }}
            />
          ))}
          {s.waves.map((wave, i) => (
            <circle
              // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
              key={i}
              cx="0"
              cy="0"
              r="30"
              fill="none"
              className="stroke-blue-soft"
              style={{
                transform: `rotate(${wave.rot}deg) scale(${wave.k})`,
                strokeWidth: wave.w,
                strokeDasharray: wave.dash,
                opacity: wave.op,
              }}
            />
          ))}
        </g>
        {s.dashesOut.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
          <BrokenStroke key={i} stroke={m} />
        ))}
        {s.crosses.map((m, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: marks have no identity of their own; the drawing is redone each frame
          <g key={i} style={{ transform: `translate(${m.x}px, ${m.y}px)`, opacity: m.op }}>
            <line
              x1="-2.2"
              y1="-2.2"
              x2="2.2"
              y2="2.2"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="stroke-red"
            />
            <line
              x1="2.2"
              y1="-2.2"
              x2="-2.2"
              y2="2.2"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="stroke-red"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// One of the two red strokes a cross or a slashed ring breaks into on contact with the ring.
function BrokenStroke({ stroke: m }: { stroke: Stroke }) {
  return (
    <g style={{ transform: `translate(${m.x}px, ${m.y}px) rotate(${m.rot}deg)`, opacity: m.op }}>
      <line
        x1="-3"
        y1="0"
        x2="3"
        y2="0"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="stroke-red"
        style={{ strokeDasharray: m.da, strokeDashoffset: m.off }}
      />
    </g>
  );
}
