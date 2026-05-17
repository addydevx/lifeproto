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
        // Base canvas — deep ink, not pure black
        ink: {
          950: "#05070d",
          900: "#0a0e1a",
          800: "#0f1424",
          700: "#161c30",
          600: "#1d2540",
          500: "#262e4d",
        },
        // Primary HUD cyan — the "system online" signal color
        cyan: {
          DEFAULT: "#00e5ff",
          dim: "#00b8cc",
          glow: "#7df9ff",
        },
        // Magenta — the warning/streak/critical color
        magenta: {
          DEFAULT: "#ff0080",
          dim: "#cc0066",
          glow: "#ff5fb3",
        },
        // Vitals (stats)
        vital: {
          health: "#00ff9d",
          mind: "#00e5ff",
          discipline: "#ffaa00",
          social: "#ff0080",
          quest: "#be64ff",
        },
        // Foreground tiers
        fg: {
          primary: "#e8f1ff",
          secondary: "#9eb4d4",
          tertiary: "#6b7a99",
          muted: "#4a5570",
        },
      },
      fontFamily: {
        // We'll load these in layout.tsx via next/font
        display: ["var(--font-display)", "monospace"],
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "system-ui"],
      },
      letterSpacing: {
        hud: "0.18em",
        wider: "0.12em",
      },
      animation: {
        "scan": "scan 8s linear infinite",
        "flicker": "flicker 3s linear infinite",
        "glitch": "glitch 0.4s ease-in-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "data-stream": "data-stream 20s linear infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "boot": "boot 1.2s steps(20) forwards",
      },
      keyframes: {
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.4" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.7" },
          "97%": { opacity: "1" },
        },
        glitch: {
          "0%, 100%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 1px)" },
          "40%": { transform: "translate(2px, -1px)" },
          "60%": { transform: "translate(-1px, -1px)" },
          "80%": { transform: "translate(1px, 1px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "brightness(1)" },
          "50%": { opacity: "0.85", filter: "brightness(1.2)" },
        },
        "data-stream": {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "0% 100%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        boot: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
      backgroundImage: {
        "grid-hud": "linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)",
        "scanlines": "repeating-linear-gradient(0deg, rgba(0,229,255,0.03) 0px, rgba(0,229,255,0.03) 1px, transparent 1px, transparent 3px)",
      },
      backgroundSize: {
        "grid-hud": "40px 40px",
      },
    },
  },
  plugins: [],
};

export default config;
