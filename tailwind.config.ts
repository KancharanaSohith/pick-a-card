import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: "#450a0a",
        gold: {
          DEFAULT: "#fbbf24",
          muted: "#b45309",
        },
        parchment: "#fef3c7",
        "wizard-bg": "#0c0a09",
      },
      fontFamily: {
        sans: ["var(--font-speakup-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: [
          "var(--font-speakup-display)",
          "var(--font-speakup-lora)",
          "Georgia",
          "serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
