import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#f2e8d5",
        "parchment-dark": "#e6d8bc",
        bark: "#5b4230",
        ink: "#2a241c",
        pine: "#24402f",
        moss: "#4c6b47",
        gold: "#d6a84c",
        berry: "#a8433b",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
      // Tailwind 3 only generates opacity modifiers on its own scale (steps of 5);
      // the HUD uses a few in-between values, so register them explicitly.
      opacity: {
        12: "0.12",
        88: "0.88",
        92: "0.92",
      },
      boxShadow: {
        panel: "0 8px 24px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
