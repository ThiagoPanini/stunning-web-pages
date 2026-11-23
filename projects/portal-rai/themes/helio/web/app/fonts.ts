import localFont from "next/font/local";

// Geist and Geist Mono, latin subset: the same files the Quadro loads from Google Fonts (Geist v5, font
// version 1.800; Geist Mono v6, font version 1.701), each a variable font with a weight axis from 100 to
// 900, with Google's latin unicode-range. The license is fonts/OFL.txt.
//
// The @font-face keeps the design's family name, so the stacks in @theme are the Quadro's own and no
// automatic fallback goes in front of them. The layout imports this module only for its @font-face rules:
// the className next/font generates names the family after the constant ("geistMono"), not the design.
// The font loader only takes literals, hence the repeated range.

export const geist = localFont({
  src: "../fonts/geist-latin.woff2",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "Geist" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const geistMono = localFont({
  src: "../fonts/geist-mono-latin.woff2",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "Geist Mono" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});
