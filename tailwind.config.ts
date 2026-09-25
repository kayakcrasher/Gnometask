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
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        panel: "0 8px 24px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
