// Tailwind 4 entra por PostCSS, o caminho que as documentações do Next e do Tailwind mostram (ADR 0005).
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
