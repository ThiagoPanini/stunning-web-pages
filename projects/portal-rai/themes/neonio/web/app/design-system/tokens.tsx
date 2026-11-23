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

function TokenRows({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col border-rule border-b">{children}</ul>;
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
            className="h-20 border border-rule"
            style={{ backgroundColor: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

export function FamilyTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample className="flex flex-col gap-2" style={{ fontFamily: variable(token) }}>
            <span className="font-light text-32-44 text-white leading-1120 tracking-tight-20">
              Atacamos primeiro. Protegemos sempre.
            </span>
            <span className="wrap-anywhere text-15 text-muted">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 × : *
            </span>
          </Sample>
        </TokenRow>
      ))}
    </TokenRows>
  );
}

// The logo's size is in cqw, a share of the width of the logo's box; here, of the sample's row.
export function SizeTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <div className="@container">
            <Sample
              className="font-display font-light text-white leading-1120"
              style={{ fontSize: variable(token) }}
            >
              Protegemos sempre.
            </Sample>
          </div>
        </TokenRow>
      ))}
    </TokenRows>
  );
}

export function WeightTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample
            className="font-display text-32-44 text-white leading-1120 tracking-tight-20"
            style={{ fontWeight: variable(token) }}
          >
            Pesquisar, desenvolver, implementar.
          </Sample>
        </TokenRow>
      ))}
    </TokenRows>
  );
}

export function TrackingTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample
            className="font-display font-light text-32-44 text-white leading-1120"
            style={{ letterSpacing: variable(token) }}
          >
            Atacamos primeiro.
          </Sample>
        </TokenRow>
      ))}
    </TokenRows>
  );
}

export function LeadingTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="border-rule-strong border-l pl-4 text-16 text-muted"
            style={{ lineHeight: variable(token) }}
          >
            O Blue Team transforma cada falha conhecida em um guardrail testável, versionado e
            medido antes de chegar a qualquer cliente.
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
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          {token.name === "--spacing" ? (
            <div className="flex flex-col gap-2">
              {SCALE_STEPS.map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <span className="w-8 shrink-0 font-mono-short text-12 text-subtle">×{step}</span>
                  <Sample
                    className="h-2 bg-violet-neon"
                    style={{ width: `calc(${variable(token)} * ${step})` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Sample className="h-2 max-w-full bg-violet-neon" style={{ width: variable(token) }} />
          )}
        </TokenRow>
      ))}
    </TokenRows>
  );
}

// A ruled grid, as the Home draws its grids: the cells on the page's color, 1px apart over the rule's.
// The column templates get six cells, which fill whole rows of two or three columns; the tab columns,
// five in a row that scrolls sideways when they do not fit, as the cycle's bar does.
export function GridTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          {token.name.startsWith("--grid-auto-columns-") ? (
            <div className="overflow-x-auto">
              <Sample
                className="grid grid-flow-col gap-px border border-rule bg-rule"
                style={{ gridAutoColumns: variable(token) }}
              >
                {[1, 2, 3, 4, 5].map((cell) => (
                  <div key={cell} className="h-10 bg-page" />
                ))}
              </Sample>
            </div>
          ) : (
            <Sample
              className="grid gap-px border border-rule bg-rule"
              style={{ gridTemplateColumns: variable(token) }}
            >
              {[1, 2, 3, 4, 5, 6].map((cell) => (
                <div key={cell} className="h-10 bg-page" />
              ))}
            </Sample>
          )}
        </TokenRow>
      ))}
    </TokenRows>
  );
}

export function RadiusTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="narrow">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="h-16 w-32 border border-rule-strong bg-placeholder"
            style={{ borderRadius: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// The blur of the neon squares: a square of light blurred by the token, the sharp square on top.
export function BlurTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="narrow">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <div className="flex h-20 items-center px-6">
            <div className="relative size-10">
              <Sample
                className="absolute inset-0 rounded-2 bg-violet-glow"
                style={{ filter: `blur(${variable(token)})` }}
              />
              <div className="absolute inset-2.5 rounded-2 bg-violet-neon" />
            </div>
          </div>
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

export function ImageTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="narrow">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="h-24 border border-rule"
            style={{ backgroundImage: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// The focus ring, drawn whole in each cell on a white block: around it in white, with the outer offset;
// with the inner offset, inside it in the page's color, as on the header's white blocks and the tabs.
export function FocusTokens({ tokens }: { tokens: Token[] }) {
  const width = tokens.find((token) => token.name === "--outline-width-focus");
  const outer = tokens.find((token) => token.name === "--outline-offset-focus");
  const ring = (token: Token): CSSProperties => {
    const inner = token.name === "--outline-offset-inset";
    const offset = token.name.startsWith("--outline-offset-") ? token : outer;
    return {
      outlineStyle: "solid",
      outlineColor: inner ? "var(--color-page)" : "var(--color-white)",
      outlineWidth: width && variable(width),
      outlineOffset: offset && variable(offset),
    };
  };
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <div className="flex h-24 items-center px-6">
            <Sample className="h-11 w-44 bg-white" style={ring(token)} />
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
