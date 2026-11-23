import localFont from "next/font/local";

// The four families of the design, latin subset: the same files Google Fonts serves the Chromium of the
// reference captures for the boards' requests, with Google's latin unicode-range. Each is a variable
// font with a weight axis:
//
// - Inter Tight v9, font version 3.004, weights 100 to 900; the board asks for 300, 400 and 500.
// - Inter v20, font version 4.001, weights 100 to 900; the board asks for 400, 500 and 600.
// - JetBrains Mono v24, font version 2.211, weights 400 to 800 (the file Google cuts for the board's
//   400 and 500).
// - Geist Mono v6, font version 1.701, weights 100 to 900; the logo board asks for 400 and 500.
//
// Google declares one @font-face per weight asked for, all on the same file; here each file has one
// @font-face with its whole weight axis, which draws every weight the design uses the same way. The
// licenses are the OFL-*.txt files next to the fonts, in fonts/.
//
// The @font-face keeps the design's family name, so the stacks in @theme are the board's own and no
// automatic fallback goes in front of them. The layout imports this module only for its @font-face rules:
// the className next/font generates names the family after the constant, not the design. The font loader
// only takes literals, hence the repeated range.

export const interTight = localFont({
  src: "../fonts/inter-tight-latin.woff2",
  weight: "100 900",
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
  src: "../fonts/inter-latin.woff2",
  weight: "100 900",
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
  src: "../fonts/jetbrains-mono-latin.woff2",
  weight: "400 800",
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
