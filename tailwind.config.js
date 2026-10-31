/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        blush: "#FBF7F0",
        baby: "#EEF7F0",
        rose: "#F5EFE6",
        pink: "#8C2A3A",
        deep: "#6E1F2D",
        cream: "#FBF7F0",
        sage: "#6FAE7C",
        ink: "#2B1D1F",
        border: "#E5D9D0",
      },
      fontFamily: {
        sans: [
          "'Nunito Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: ["'Baloo 2'", "ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
      },
      fontSize: {
        "display-lg": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        "section": ["1.5rem", { lineHeight: "1.35" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body": ["1rem", { lineHeight: "1.6" }],
        "sm": ["0.9375rem", { lineHeight: "1.55" }],
        "xs": ["0.8125rem", { lineHeight: "1.5" }],
      },
      spacing: {
        1: "0.25rem",
        2: "0.5rem",
        3: "0.75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        12: "3rem",
        16: "4rem",
        20: "5rem",
      },
      borderRadius: {
        sm: "0.375rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.25rem",
        organic: "1.625rem",
      },
      boxShadow: {
        soft: "0 4px 20px -6px rgba(141, 67, 95, 0.08)",
        softLG: "0 8px 32px -10px rgba(141, 67, 95, 0.10)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.7s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
