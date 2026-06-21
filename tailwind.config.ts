import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import containerQueries from "@tailwindcss/container-queries";

// Design tokens ported 1:1 from the KPC "Industrial Integrity System"
// design spec (DESIGN.md, exported from the Stitch mockups).
// Keeping these names identical to the mockup HTML means any markup
// copied from a Stitch screen (bg-primary, text-on-surface-variant,
// text-headline-lg, etc.) will work without modification.

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f9f9fc",
        "surface-dim": "#dadadc",
        "surface-bright": "#f9f9fc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f6",
        "surface-container": "#eeeef0",
        "surface-container-high": "#e8e8ea",
        "surface-container-highest": "#e2e2e5",
        "surface-variant": "#e2e2e5",
        "on-surface": "#1a1c1e",
        "on-surface-variant": "#424751",
        "inverse-surface": "#2f3133",
        "inverse-on-surface": "#f0f0f3",
        outline: "#737782",
        "outline-variant": "#c2c6d3",
        "surface-tint": "#245eaa",

        // KPC Blue — navigation, primary actions, institutional trust
        primary: "#00366e",
        "on-primary": "#ffffff",
        "primary-container": "#004c97",
        "on-primary-container": "#9bbfff",
        "inverse-primary": "#a9c7ff",
        "primary-fixed": "#d6e3ff",
        "primary-fixed-dim": "#a9c7ff",
        "on-primary-fixed": "#001b3d",
        "on-primary-fixed-variant": "#00468c",

        // Safety Orange — reserved for alerts, hazard warnings, critical CTAs
        secondary: "#a33e00",
        "on-secondary": "#ffffff",
        "secondary-container": "#fe6500",
        "on-secondary-container": "#541d00",
        "secondary-fixed": "#ffdbcd",
        "secondary-fixed-dim": "#ffb596",
        "on-secondary-fixed": "#360f00",
        "on-secondary-fixed-variant": "#7c2e00",

        tertiary: "#353737",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#4b4d4e",
        "on-tertiary-container": "#bdbebe",
        "tertiary-fixed": "#e2e2e2",
        "tertiary-fixed-dim": "#c6c6c7",
        "on-tertiary-fixed": "#1a1c1c",
        "on-tertiary-fixed-variant": "#454747",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#f9f9fc",
        "on-background": "#1a1c1e",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },

      // Full type scale from DESIGN.md. Each entry bundles its own
      // lineHeight / letterSpacing / fontWeight so e.g. `text-headline-lg`
      // applies the complete style in one class, exactly as the mockups do.
      fontSize: {
        "display-lg": [
          "48px",
          { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-lg-mobile": [
          "28px",
          { lineHeight: "36px", fontWeight: "600" },
        ],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-lg": [
          "14px",
          { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" },
        ],
        "label-md": [
          "12px",
          { lineHeight: "16px", letterSpacing: "0.04em", fontWeight: "600" },
        ],
        "label-sm": ["11px", { lineHeight: "16px", fontWeight: "500" }],
      },

      // 4px baseline spacing rhythm
      spacing: {
        unit: "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "32px",
        "margin-mobile": "16px",
        "margin-desktop": "32px",
        gutter: "24px",
      },

      maxWidth: {
        "screen-max": "1440px",
      },

      // NOTE: the raw Stitch export remapped Tailwind's `full` radius to
      // 0.75rem, which would silently break perfectly round elements
      // (avatars, circular icon buttons) anywhere else in the app. We keep
      // Tailwind's native `rounded-full` (9999px) intact and only add the
      // named scale from DESIGN.md alongside it.
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },

      boxShadow: {
        // Level 3 modal/popover elevation from DESIGN.md
        elevated: "0px 8px 24px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [forms, containerQueries],
};

export default config;
