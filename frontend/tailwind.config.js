/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070b14",
          card: "#0f172a",
          border: "#1e293b",
          cyan: "#00f0ff",
          cyanGlow: "rgba(0, 240, 255, 0.15)",
          red: "#ff2a5f",
          redGlow: "rgba(255, 42, 95, 0.2)",
          amber: "#ffb800",
          amberGlow: "rgba(255, 184, 0, 0.15)",
          green: "#00e676",
          greenGlow: "rgba(0, 230, 118, 0.15)",
          purple: "#a855f7",
          text: "#f8fafc",
          muted: "#94a3b8"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'flow-line': 'flowLine 1.5s infinite linear',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
