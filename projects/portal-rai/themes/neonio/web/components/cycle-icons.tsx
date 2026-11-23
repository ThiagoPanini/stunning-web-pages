import type { ReactNode } from "react";

type TabIconProps = {
  children: ReactNode;
  // The board rounds the line ends of every icon but the shield, and the joins of two of them.
  roundCaps?: boolean;
  roundJoins?: boolean;
};

// The frame of the cycle's tab icons: 18px, stroked in the text color and a little faded (.uk-tab svg).
function TabIcon({ children, roundCaps = true, roundJoins = false }: TabIconProps) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap={roundCaps ? "round" : undefined}
      strokeLinejoin={roundJoins ? "round" : undefined}
      className="block shrink-0 grow-0 opacity-85"
    >
      {children}
    </svg>
  );
}

// Atacar: a crosshair.
export function AttackIcon() {
  return (
    <TabIcon>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M9 1.5v3.2M9 13.3v3.2M1.5 9h3.2M13.3 9h3.2" />
    </TabIcon>
  );
}

// Descobrir: a magnifying glass.
export function DiscoverIcon() {
  return (
    <TabIcon>
      <circle cx="7.8" cy="7.8" r="5" />
      <path d="M11.6 11.6 16 16" />
    </TabIcon>
  );
}

// Desenvolver: code brackets.
export function DevelopIcon() {
  return (
    <TabIcon roundJoins>
      <path d="M6.2 4.8 2 9l4.2 4.2M11.8 4.8 16 9l-4.2 4.2" />
    </TabIcon>
  );
}

// Proteger: a shield.
export function ProtectIcon() {
  return (
    <TabIcon roundCaps={false} roundJoins>
      <path d="M9 1.8 3.2 4.1v4.3c0 3.5 2.4 6.2 5.8 7.7 3.4-1.5 5.8-4.2 5.8-7.7V4.1z" />
    </TabIcon>
  );
}

// Medir: bars.
export function MeasureIcon() {
  return (
    <TabIcon>
      <path d="M3 15.5V10M7 15.5V5.5M11 15.5V8.5M15 15.5V3" />
    </TabIcon>
  );
}
