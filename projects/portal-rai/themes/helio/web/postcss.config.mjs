// Tailwind 4 comes in through PostCSS, the path the Next and Tailwind docs show (ADR 0005).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
