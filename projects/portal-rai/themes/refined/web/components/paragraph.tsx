import type { ReactNode } from "react";

type ParagraphProps = {
  children: ReactNode;
  // 14px instead of 16px, as the notes under a list or a result.
  small?: boolean;
  // muted on the page; pale on a media placeholder.
  tone?: "muted" | "pale";
  // Classes of its place: margins, alignment, width. Not size or color, which the props above set.
  className?: string;
};

// The body paragraph of the sections (rf-p): muted, 16px, with lines that avoid a lonely last word.
export function Paragraph({
  children,
  small = false,
  tone = "muted",
  className = "",
}: ParagraphProps) {
  const size = small ? "text-14" : "text-16";
  const color = tone === "pale" ? "text-pale" : "text-muted";
  return (
    <p className={`text-pretty leading-150 tracking-tight-10 ${size} ${color} ${className}`}>
      {children}
    </p>
  );
}
