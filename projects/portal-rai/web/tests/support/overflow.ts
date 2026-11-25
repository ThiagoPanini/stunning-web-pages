// The horizontal spill check of every spec that looks for one.

import type { Page } from "@playwright/test";
import type { BlockName } from "./reference";

// Elements of the given blocks (all of them by default), the blocks included, whose visible part leaves
// [0, width], the page's own edges. Not what Next adds to the body, such as its hidden route announcer.
//
// The page clips its sides (overflow-x: clip), which would hide a spill, so each element is measured. A
// spill is what the user would see past the page's edges; what a frame inside the page hides is not one.
// The visible part is the element's box, widened by the content that runs out of it when nothing there
// clips it (a line that does not wrap), then cut sideways by each ancestor inside the blocks that clips
// its overflow, such as the logo's frame, which hides whatever of its drawing runs past it; the page's
// own clip, above the blocks, is the one this check sees past. A positioned element escapes the clips
// between it and its containing block, so those are skipped; an ancestor not known to contain it is
// skipped too, which can only report more.
export function spilledElements(
  page: Page,
  width: number,
  blocks?: BlockName[],
): Promise<string[]> {
  const roots = blocks ? blocks.map((block) => `[data-block="${block}"]`) : ["[data-block]"];
  const selector = roots.flatMap((root) => [root, `${root} *`]).join(", ");
  return page.locator(selector).evaluateAll(
    (elements, pageWidth) =>
      elements
        .filter((element) => {
          let { left, right } = element.getBoundingClientRect();
          const own = getComputedStyle(element);
          if (own.overflowX === "visible" && element.scrollWidth > element.clientWidth) {
            right = Math.max(right, left + element.clientLeft + element.scrollWidth);
          }
          let position = own.position;
          let ancestor = element;
          while (!ancestor.hasAttribute("data-block") && ancestor.parentElement) {
            ancestor = ancestor.parentElement;
            const style = getComputedStyle(ancestor);
            const contains =
              position === "fixed"
                ? style.transform !== "none"
                : position === "absolute"
                  ? style.position !== "static" || style.transform !== "none"
                  : true;
            if (!contains) continue;
            position = style.position;
            if (style.overflowX === "visible") continue;
            const clip = ancestor.getBoundingClientRect();
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          return right > left && (left < -0.5 || right > pageWidth + 0.5);
        })
        .map((element) => element.outerHTML.slice(0, 120)),
    width,
  );
}
