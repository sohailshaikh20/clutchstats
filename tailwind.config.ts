import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F1923",
        surface: "#1A2634",
        "surface-light": "#243447",
        "surface-lighter": "#2D3F52",
        "accent-red": "#FF4655",
        "accent-blue": "#1FAAED",
        "accent-gold": "#F5C542",
        "text-primary": "#ECE8E1",
        "text-secondary": "#768691",
        win: "#4AE3A7",
        loss: "#FF4655",
        draw: "#768691",
      },
      boxShadow: {
        "glow-red": "0 0 20px rgba(255,70,85,0.3)",
        "glow-blue": "0 0 20px rgba(31,170,237,0.3)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        "mono-display": ["var(--font-mono-display)", "ui-monospace", "monospace"],
        "sans-tight": ["var(--font-sans-tight)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
