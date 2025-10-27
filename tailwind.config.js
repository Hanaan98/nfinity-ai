/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // AI-focused color palette
        ai: {
          primary: "#0066ff",
          secondary: "#00d4ff",
          accent: "#7c3aed",
          success: "#00ff88",
          warning: "#ffaa00",
          error: "#ff4444",
          surface: "#111827",
          "surface-elevated": "#1f2937",
          "surface-hover": "#374151",
          border: "#4b5563",
          "border-hover": "#6b7280",
          "text-primary": "#ffffff",
          "text-secondary": "#e5e7eb",
          "text-tertiary": "#d1d5db",
        },
        // Neural network inspired gradients
        neural: {
          blue: "#0066ff",
          cyan: "#00d4ff",
          purple: "#7c3aed",
          pink: "#ec4899",
          indigo: "#6366f1",
        },
      },
      backgroundImage: {
        "ai-gradient": "linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)",
        "neural-gradient":
          "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #0066ff 100%)",
        "surface-gradient": "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
      },
      animation: {
        "gradient-shift": "gradient-shift 3s ease infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "neural-flow": "neural-flow 4s ease-in-out infinite",
        "data-stream": "data-stream 2s linear infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "neural-flow": {
          "0%, 100%": {
            transform: "translateX(-50%) translateY(-50%) rotate(0deg)",
          },
          "33%": {
            transform: "translateX(-50%) translateY(-50%) rotate(120deg)",
          },
          "66%": {
            transform: "translateX(-50%) translateY(-50%) rotate(240deg)",
          },
        },
        "data-stream": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      boxShadow: {
        neural:
          "0 0 20px rgba(0, 102, 255, 0.1), 0 0 40px rgba(0, 212, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "ai-glow": "0 0 15px rgba(0, 102, 255, 0.3)",
        "success-glow": "0 0 15px rgba(0, 255, 136, 0.3)",
        "warning-glow": "0 0 15px rgba(255, 170, 0, 0.3)",
        glass:
          "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      },
      backdropBlur: {
        glass: "20px",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      screens: {
        xs: "475px",
        "3xl": "1600px",
      },
    },
  },
  plugins: [],
};
