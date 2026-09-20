import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#13151B", // base background
          surface: "#1B1E27", // card / panel surface
          raised: "#22252F", // hover / raised surface
          border: "#2A2E38",
        },
        paper: {
          DEFAULT: "#ECEDF1", // primary text
          muted: "#9AA0AE", // secondary text
          faint: "#5C6270", // tertiary text
        },
        tally: {
          DEFAULT: "#F2A93B", // amber accent - primary actions, "ready" states
          dim: "#B9822C",
        },
        reel: {
          DEFAULT: "#3FC1C9", // teal - in-progress / processing states
          dim: "#2C9AA1",
        },
        cut: {
          DEFAULT: "#E85A5A", // red - failed / destructive states
          dim: "#B84545",
        },
        wrap: {
          DEFAULT: "#6FCF7A", // green - completed states
          dim: "#4FA85B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "pulse-dot": "pulseDot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
