import type { CSSProperties, ReactNode } from "react";
import { TokenName } from "./parts";
import type { Token } from "./theme-tokens";

// One view per kind of token. Each token is an element marked data-token with its name, its value and,
// where the kind can be drawn, a sample whose style reads the variable itself.

const variable = (token: Token) => `var(${token.name})`;

function TokenGrid({ min, children }: { min: "narrow" | "wide"; children: ReactNode }) {
  const columns =
    min === "narrow"
      ? "grid-cols-[repeat(auto-fill,minmax(min(160px,100%),1fr))]"
      : "grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))]";
  return <ul className={`grid gap-x-6 gap-y-8 ${columns}`}>{children}</ul>;
}

// A token in a grid cell: the sample above, the name and value below.
function TokenCell({ token, children }: { token: Token; children?: ReactNode }) {
  return (
    <li data-token={token.name} className="flex min-w-0 flex-col gap-3">
      {children}
      <TokenName token={token} />
    </li>
  );
}

// A token in a ruled row: the sample on the left, the name and value on the right.
function TokenRow({ token, children }: { token: Token; children: ReactNode }) {
  return (
    <li
      data-token={token.name}
      className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-rule border-t py-5"
    >
      <div className="min-w-0 grow basis-80">{children}</div>
      <div className="shrink-0 basis-60">
        <TokenName token={token} />
      </div>
    </li>
  );
}

function Sample({
  style,
  className = "",
  children,
}: {
  style: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div data-sample="" className={className} style={style}>
      {children}
    </div>
  );
}

export function ColorTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="narrow">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="h-20 rounded-10 border border-rule"
            style={{ backgroundColor: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

export function FamilyTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample className="flex flex-col gap-2" style={{ fontFamily: variable(token) }}>
            <span className="font-light text-28-42 leading-110 tracking-tight-25">
              Atacamos primeiro. Protegemos sempre.
            </span>
            <span className="wrap-anywhere text-15 text-muted">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
            </span>
          </Sample>
        </TokenRow>
      ))}
    </ul>
  );
}

export function SizeTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample className="font-light leading-115" style={{ fontSize: variable(token) }}>
            Protegemos sempre.
          </Sample>
        </TokenRow>
      ))}
    </ul>
  );
}

export function WeightTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample
            className="text-28-42 leading-110 tracking-tight-25"
            style={{ fontWeight: variable(token) }}
          >
            Pesquisar, desenvolver, implementar.
          </Sample>
        </TokenRow>
      ))}
    </ul>
  );
}

export function TrackingTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample
            className="font-light text-28-42 leading-110"
            style={{ letterSpacing: variable(token) }}
          >
            Atacamos primeiro.
          </Sample>
        </TokenRow>
      ))}
    </ul>
  );
}

export function LeadingTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="border-rule-strong border-l pl-4 text-15 text-muted"
            style={{ lineHeight: variable(token) }}
          >
            Transformamos cada falha conhecida em um guardrail testável, versionado e medido antes
            de chegar a qualquer cliente.
          </Sample>
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// Multiples of --spacing, the base of Tailwind's spacing scale: gap-4 is 4 times --spacing.
const SCALE_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 24];

export function SpacingTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          {token.name === "--spacing" ? (
            <div className="flex flex-col gap-2">
              {SCALE_STEPS.map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="w-8 shrink-0 font-mono text-12 text-subtle">×{step}</span>
                  <Sample
                    className="h-2 rounded-pill bg-blue"
                    style={{ width: `calc(${variable(token)} * ${step})` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Sample
              className="h-2 max-w-full rounded-pill bg-blue"
              style={{ width: variable(token) }}
            />
          )}
        </TokenRow>
      ))}
    </ul>
  );
}

// A grid of the page with four cells: as many columns as fit the row, each at least its minimum.
export function GridTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample className="grid gap-4" style={{ gridTemplateColumns: variable(token) }}>
            {[1, 2, 3, 4].map((cell) => (
              <div key={cell} className="h-10 rounded-10 border border-rule bg-surface" />
            ))}
          </Sample>
        </TokenRow>
      ))}
    </ul>
  );
}

// Two parts of a row that start from the same basis: the first grows by 1, the sample by the token.
export function GrowTokens({ tokens }: { tokens: Token[] }) {
  return (
    <ul className="flex flex-col">
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className="flex gap-2">
            <div className="h-2 grow basis-0 rounded-pill bg-rule-strong" />
            <Sample
              className="h-2 basis-0 rounded-pill bg-blue"
              style={{ flexGrow: variable(token) }}
            />
          </div>
        </TokenRow>
      ))}
    </ul>
  );
}

export function RadiusTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="narrow">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="h-16 w-32 border border-rule-strong bg-surface"
            style={{ borderRadius: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

export function EffectTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          {token.name.startsWith("--shadow-") ? (
            <div className="flex h-24 items-center px-6">
              <Sample
                className="h-11 w-44 rounded-10 bg-bright"
                style={{ boxShadow: variable(token) }}
              />
            </div>
          ) : (
            <div className="relative h-24 overflow-hidden rounded-10 border border-rule">
              <div
                aria-hidden="true"
                className="flex h-full items-center justify-around font-light text-28-42"
              >
                <span className="text-red">×</span>
                <span className="text-blue">:</span>
                <span className="text-bright">●</span>
              </div>
              <Sample
                className="absolute inset-x-0 top-1/2 bottom-0 border-white-7 border-t bg-header"
                style={{ backdropFilter: `blur(${variable(token)})` }}
              />
            </div>
          )}
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// The focus ring, drawn whole in each cell: its width and its offset, in the color of the focus.
export function FocusTokens({ tokens }: { tokens: Token[] }) {
  const width = tokens.find((token) => token.name.startsWith("--outline-width-"));
  const offset = tokens.find((token) => token.name.startsWith("--outline-offset-"));
  // Each sample draws the ring with its own token, and the first token of the other kind.
  const ring = (token: Token): CSSProperties => {
    const own = token.name.startsWith("--outline-width-") ? "width" : "offset";
    return {
      outlineStyle: "solid",
      outlineColor: "var(--color-blue)",
      outlineWidth: own === "width" ? variable(token) : width && variable(width),
      outlineOffset: own === "offset" ? variable(token) : offset && variable(offset),
    };
  };
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <div className="flex h-24 items-center px-6">
            <Sample className="h-11 w-44 rounded-10 bg-bright" style={ring(token)} />
          </div>
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// Tokens with no drawing of their own (motion, and any namespace the route does not know): name and
// value only.
export function PlainTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token} />
      ))}
    </TokenGrid>
  );
}

// A box in the token's proportion, at a fixed height: its width follows the ratio.
export function AspectTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="gif-stripes h-24 max-w-full self-start rounded-6 border border-rule-strong border-dashed bg-night"
            style={{ aspectRatio: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}
