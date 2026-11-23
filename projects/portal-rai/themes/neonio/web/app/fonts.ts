import localFont from "next/font/local";

// The four families of the design, latin subset: the same files Google Fonts serves the Chromium of the
// reference captures for the boards' requests (Inter Tight v9, Inter v20, JetBrains Mono v24 and Geist
// Mono v6), each a variable font with a weight axis. The licenses are the OFL-*.txt files next to them,
// in fonts/.
//
// Each face is declared as Google declares it: one @font-face per weight the board asks for, all on the
// same file, with Google's latin unicode-range. The board asks for Inter Tight 300, 400 and 500, Inter
// 400, 500 and 600, JetBrains Mono 400 and 500, and, for the logo, Geist Mono 400 and 500.
//
// The @font-face keeps the design's family name, so the stacks in @theme are the board's own and no
// automatic fallback goes in front of them. The layout imports this module only for its @font-face rules:
// the className next/font generates names the family after the constant, not the design. The font loader
// only takes literals, hence the repeated paths and range.

export const interTight = localFont({
  src: [
    { path: "../fonts/inter-tight-latin.woff2", weight: "300" },
    { path: "../fonts/inter-tight-latin.woff2", weight: "400" },
    { path: "../fonts/inter-tight-latin.woff2", weight: "500" },
  ],
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "Inter Tight" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const inter = localFont({
  src: [
    { path: "../fonts/inter-latin.woff2", weight: "400" },
    { path: "../fonts/inter-latin.woff2", weight: "500" },
    { path: "../fonts/inter-latin.woff2", weight: "600" },
  ],
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "Inter" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const jetBrainsMono = localFont({
  src: [
    { path: "../fonts/jetbrains-mono-latin.woff2", weight: "400" },
    { path: "../fonts/jetbrains-mono-latin.woff2", weight: "500" },
  ],
  display: "swap",
  adjustFontFallback: false,
  declarations: [
    { prop: "font-family", value: "JetBrains Mono" },
    {
      prop: "unicode-range",
      value:
        "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
    },
  ],
});

export const geistMono = localFont({
  src: [
    { path: "../fonts/geist-mono-latin.woff2", weight: "400" },
    { path: "../fonts/geist-mono-latin.woff2", weight: "500" },
  ],
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
