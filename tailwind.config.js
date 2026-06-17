/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0F1B2E", // navy: texto y secciones oscuras
        pine: "#1D4ED8", // azul primario (botones, enlaces)
        moss: "#3B82F6", // azul de acento
        marigold: "#0EA5E9", // sky: énfasis (puntos, etiquetas)
        clay: "#0891B2", // cyan: CTA
        paper: "#F1F5F9", // slate-100: fondo principal
        "paper-2": "#E2E8F0", // slate-200: fondos secundarios
        line: "#CBD5E1", // slate-300: bordes
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      boxShadow: {
        card: "0 10px 30px rgba(21,32,27,.08)",
        lift: "0 16px 40px rgba(21,32,27,.14)",
      },
    },
  },
  plugins: [],
};
