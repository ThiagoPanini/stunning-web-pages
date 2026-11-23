import type { MouseEventHandler, ReactNode } from "react";

type CycleTabProps = {
  // The step it leads to, as an anchor of the page: "#cycle-step-1".
  href: `#${string}`;
  // The tab's line icon, drawn in the text color.
  icon: ReactNode;
  children: ReactNode;
  // The current tab is the step in view; it is filled and white, and says so as aria-current="step".
  current: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

// A tab of the cycle's bar (.uk-tab): an anchor to its step, not an ARIA tab. Grey text that turns white
// on hover; the current one sits on a lighter fill. The focus ring is drawn inside it.
export function CycleTab({ href, icon, children, current, onClick }: CycleTabProps) {
  return (
    <a
      href={href}
      aria-current={current ? "step" : "false"}
      onClick={onClick}
      className={`flex min-h-15.75 flex-auto items-center justify-center gap-2.5 whitespace-nowrap px-4 text-18 tracking-tight-10 transition-[color,background-color] hover:text-white focus-visible:outline-offset-inset ${current ? "bg-tab-current text-white" : "text-muted"}`}
    >
      {icon}
      {children}
    </a>
  );
}
