import type { CSSProperties, ReactNode } from "react";
import { TokenName } from "./parts";
import type { Token } from "./theme-tokens";

// One view per kind of token. Each token is an element marked data-token with its name, its value and,
// where the kind can be drawn, a sample whose style reads the variable itself.

const variable = (token: Token) => `var(${token.name})`;

function TokenGrid({ min, children }: { min: "narrow" | "wide"; children: ReactNode }) {
  const columns =
    min === "narrow"
      ? "grid-cols-[repeat(auto-fill,minmax(min(150px,100%),1fr))]"
      : "grid-cols-[repeat(auto-fill,minmax(min(260px,100%),1fr))]";
  return <ul className={`grid gap-x-4 gap-y-8 ${columns}`}>{children}</ul>;
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
      className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-bright-9 border-t py-5"
    >
      <div className="min-w-0 grow basis-80">{children}</div>
      <div className="shrink-0 basis-55">
        <TokenName token={token} />
      </div>
    </li>
  );
}

function TokenRows({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col border-bright-9 border-b">{children}</ul>;
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
            className="h-20 rounded-16 border border-bright-9"
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
            <span className="font-normal text-32 leading-110 tracking-tight-30">
              Atacamos primeiro. Protegemos sempre.
            </span>
            <span className="wrap-anywhere text-15 text-muted">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789 ×:*·o+ø
            </span>
          </Sample>
        </TokenRow>
      ))}
    </TokenRows>
  );
}

// The logo's size is a share of its frame's width (cqw): its sample sits in a frame as wide as the logo
// board's, so it shows the size the board draws.
const isContainerSize = (token: Token) => token.value.endsWith("cqw");

export function SizeTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          {isContainerSize(token) ? (
            <div className="@container w-140 max-w-full">
              <Sample
                className="whitespace-pre font-logo text-logo-bright leading-1200"
                style={{ fontSize: variable(token) }}
              >
                {"·  ×  :  *  o  +  ø"}
              </Sample>
            </div>
          ) : (
            <Sample className="font-normal leading-115" style={{ fontSize: variable(token) }}>
              Protegemos sempre.
            </Sample>
          )}
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
            className="text-32 leading-110 tracking-tight-30"
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
            className="font-normal text-32 leading-110"
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
            className="border-cream border-l pl-4 text-15 text-muted"
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
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          {token.name === "--spacing" ? (
            <div className="flex flex-col gap-2">
              {SCALE_STEPS.map((step) => (
                <div key={step} className="flex items-center gap-4">
                  <code className="w-8 shrink-0 text-12 text-muted">×{step}</code>
                  <Sample
                    className="h-2 rounded-pill bg-cream"
                    style={{ width: `calc(${variable(token)} * ${step})` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Sample
              className="h-2 max-w-full rounded-pill bg-cream"
              style={{ width: variable(token) }}
            />
          )}
        </TokenRow>
      ))}
    </TokenRows>
  );
}

// A grid of four cells with the token's columns.
export function GridTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenRows>
      {tokens.map((token) => (
        <TokenRow key={token.name} token={token}>
          <Sample className="grid gap-4" style={{ gridTemplateColumns: variable(token) }}>
            {[1, 2, 3, 4].map((cell) => (
              <div key={cell} className="h-10 rounded-10 bg-surface" />
            ))}
          </Sample>
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
            className="h-16 w-32 max-w-full border border-bright-9 bg-raised"
            style={{ borderRadius: variable(token) }}
          />
        </TokenCell>
      ))}
    </TokenGrid>
  );
}

// A media placeholder's box in the token's proportion, at a fixed height that keeps the route on whole
// pixels: its width follows the ratio.
export function AspectTokens({ tokens }: { tokens: Token[] }) {
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => (
        <TokenCell key={token.name} token={token}>
          <Sample
            className="h-24 max-w-full self-start rounded-16 bg-surface"
            style={{ aspectRatio: variable(token) }}
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
                className="h-12 w-44 rounded-12 bg-cream"
                style={{ boxShadow: variable(token) }}
              />
            </div>
          ) : (
            <div className="relative h-24 overflow-hidden rounded-16 bg-surface">
              <div aria-hidden="true" className="flex h-full items-center justify-around text-32">
                <span className="text-red">×</span>
                <span className="text-blue">:</span>
                <span className="text-cream">●</span>
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

// The focus ring, drawn whole in each cell, in the color of the focus: a width token with the page's
// offset, an offset token with the ring's width.
export function FocusTokens({ tokens }: { tokens: Token[] }) {
  const isWidth = (token: Token) => token.name.startsWith("--outline-width-");
  const width = tokens.find(isWidth);
  const offset = tokens.find((token) => !isWidth(token));
  return (
    <TokenGrid min="wide">
      {tokens.map((token) => {
        const ring: CSSProperties = {
          outlineStyle: "solid",
          outlineColor: "var(--color-cream)",
          outlineWidth: variable(isWidth(token) ? token : (width ?? token)),
          outlineOffset: variable(isWidth(token) ? (offset ?? token) : token),
        };
        return (
          <TokenCell key={token.name} token={token}>
            <div className="flex h-24 items-center px-6">
              <Sample className="h-12 w-44 rounded-10 bg-field" style={ring} />
            </div>
          </TokenCell>
        );
      })}
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
