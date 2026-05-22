import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-container": "var(--surface-container)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        primary: "var(--primary)",
        "on-primary": "var(--on-primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        secondary: "var(--secondary)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        "secondary-fixed": "var(--secondary-fixed)",
        "secondary-fixed-dim": "var(--secondary-fixed-dim)",
        "tertiary-container": "var(--tertiary-container)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        error: "var(--error)",
        "card-cream": "var(--card-cream)",
      },
      spacing: {
        "sidebar-width": "280px",
        "container-padding": "40px",
        "card-padding": "32px",
        "section-gap": "64px",
        gutter: "24px",
        "unit-lg": "24px",
        "unit-md": "16px",
        "unit-xl": "40px",
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "headline-sm": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "700" }],
        "stat-lg": ["40px", { lineHeight: "1", fontWeight: "700" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
