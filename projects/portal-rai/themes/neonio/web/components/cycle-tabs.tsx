"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { CycleTab } from "./cycle-tab";

export type CycleTabItem = {
  // The id of the step the tab leads to.
  target: string;
  label: string;
  icon: ReactNode;
};

// The scroll-spy of the board: the current step is the last one whose top has passed a third of the
// room below the bar, that room counted up to 900px.
const ROOM_SHARE = 0.33;
const MAX_ROOM = 900;

// The bar of the cycle's tabs, sticky below the header (at the top of the window at 760px and below,
// where the header scrolls away). A click on a tab marks it current and the anchor takes the page to its
// step; scrolling marks the step in view. Five columns of at least 136px: when they do not fit, the bar
// scrolls sideways, with no scrollbar.
export function CycleTabs({ tabs }: { tabs: CycleTabItem[] }) {
  const [current, setCurrent] = useState(0);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    // At most once per frame, as the board does.
    const spy = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!bar.current) return;
        const base = bar.current.getBoundingClientRect().bottom;
        const room = Math.max(0, Math.min(window.innerHeight - base, MAX_ROOM));
        const limit = base + room * ROOM_SHARE;
        let step = 0;
        tabs.forEach(({ target }, index) => {
          const top = document.getElementById(target)?.getBoundingClientRect().top;
          if (top !== undefined && top <= limit) step = index;
        });
        setCurrent(step);
      });
    };
    window.addEventListener("scroll", spy, { passive: true });
    window.addEventListener("resize", spy);
    spy();
    return () => {
      window.removeEventListener("scroll", spy);
      window.removeEventListener("resize", spy);
      cancelAnimationFrame(frame);
    };
  }, [tabs]);

  return (
    <div ref={bar} className="sticky top-13.5 z-25 bg-page upto-760:top-0">
      <nav aria-label="Etapas do ciclo">
        <ul className="grid scrollbar-none auto-cols-tabs grid-flow-col gap-px overflow-x-auto border-rule border-y bg-rule">
          {tabs.map(({ target, label, icon }, index) => (
            <li key={target} className="flex bg-page">
              <CycleTab
                href={`#${target}`}
                icon={icon}
                current={index === current}
                onClick={() => setCurrent(index)}
              >
                {label}
              </CycleTab>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
