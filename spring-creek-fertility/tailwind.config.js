/**
 * tailwind.config.js — Spring Creek Fertility
 * ---------------------------------------------------------------------------
 * Maps Tailwind utilities (bg-scf-teal, text-scf-teal-dark, font-display, …)
 * onto the brand design tokens defined in springcreekglobal.css.
 *
 * Colors reference the CSS custom properties so springcreekglobal.css remains
 * the single source of truth — change a token there and every utility updates.
 * Make sure springcreekglobal.css is loaded on the page (it defines :root vars
 * and imports the Playfair Display / Open Sans / Poppins families).
 *
 * Merge `theme.extend` into your existing config if you already have one.
 */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./HomepageBody.tsx",
  ],
  theme: {
    extend: {
      colors: {
        scf: {
          teal: "var(--scf-teal)",
          "teal-alt": "var(--scf-teal-alt)",
          "teal-dark": "var(--scf-teal-dark)",
          "teal-light": "var(--scf-teal-light)",
          blue: "var(--scf-blue)",
          "blue-soft": "var(--scf-blue-soft)",
          navy: "var(--scf-navy)",
          cream: "var(--scf-cream)",
          "cream-soft": "var(--scf-cream-soft)",
          muted: "var(--scf-gray-500)",
          line: "var(--scf-gray-300)",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", '"Times New Roman"', "serif"],
        body: ['"Open Sans"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        ui: ['"Poppins"', '"Open Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        "scf-sm": "0 2px 8px rgba(0, 97, 107, 0.08)",
        scf: "0 10px 30px rgba(0, 97, 107, 0.12)",
        "scf-lg": "0 24px 60px rgba(0, 97, 107, 0.16)",
      },
      borderRadius: {
        scf: "12px",
        "scf-lg": "20px",
      },
      maxWidth: {
        "scf-container": "1200px",
      },
    },
  },
  plugins: [],
};
