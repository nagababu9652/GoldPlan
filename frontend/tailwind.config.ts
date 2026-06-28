import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bone:   { DEFAULT: "#F8F6F0", deep: "#EFECE4" },
        obsidian: { DEFAULT: "#0C0B0A", soft: "#1A1816" },
        antique:  { DEFAULT: "#B48E4B", dark: "#9E7B35", light: "#D4B47A" },
        ash:    { DEFAULT: "#5C5850", light: "#8A857B" },
        line:   "#E2DED5",
      },
      fontFamily: {
        serif: ["var(--font-serif)", '"Cormorant Garamond"', "serif"],
        sans:  ["var(--font-sans)", '"Outfit"', "sans-serif"],
        mono:  ["var(--font-mono)", '"IBM Plex Mono"', "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        wider2: "0.2em",
      },
      animation: {
        "fade-up": "fadeUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
