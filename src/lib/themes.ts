import type { CSSProperties } from "react";

/**
 * Site themes.
 *
 * A theme is a set of CSS custom properties applied to the root of a rendered
 * site. Because every block reads its colours, radii, shadows and typefaces
 * from those properties (see globals.css), one block system renders as several
 * visually distinct templates without duplicating any component code.
 *
 * Themes other than `studio` declare their palette outright rather than
 * following the visitor's OS colour scheme — a template designed as a warm
 * light system shouldn't invert itself on half the machines that visit it.
 */
export type SiteTheme = {
  id: string;
  name: string;
  description: string;
  /** Swatch shown in the picker: [background, surface, accent]. */
  swatch: [string, string, string];
  vars: Record<string, string>;
};

const FONT = {
  outfit: "var(--font-outfit)",
  workSans: "var(--font-work-sans)",
  spaceGrotesk: "var(--font-space-grotesk)",
  dmSans: "var(--font-dm-sans)",
  baloo: "var(--font-baloo)",
  nunito: "var(--font-nunito)",
  cormorant: "var(--font-cormorant)",
  inter: "var(--font-inter)",
} as const;

export const THEMES: SiteTheme[] = [
  {
    id: "studio",
    name: "Studio",
    description:
      "Clean and modern, with soft elevation. Follows the visitor's light or dark setting.",
    swatch: ["#ffffff", "#f7f7f8", "#131316"],
    // Empty: falls through to the defaults in globals.css, including the
    // prefers-color-scheme response.
    vars: {},
  },
  {
    id: "agency",
    name: "Agency grid",
    description:
      "Editorial and architectural. Oversized type, hairline rules, almost no shadow.",
    swatch: ["#f4f4f1", "#ffffff", "#1a1a18"],
    vars: {
      "--site-background": "#f4f4f1",
      "--site-foreground": "#1a1a18",
      "--site-surface": "#ffffff",
      "--site-surface-subtle": "#eceae4",
      "--site-border": "rgba(26, 26, 24, 0.14)",
      "--site-border-strong": "rgba(26, 26, 24, 0.28)",
      "--site-muted": "rgba(26, 26, 24, 0.58)",
      "--site-accent": "#1a1a18",
      // Structure comes from the grid and hairline rules, not from chrome.
      "--site-radius-card": "0.25rem",
      "--site-radius-pill": "0.25rem",
      "--site-shadow-soft": "none",
      "--site-shadow-raised": "none",
      "--site-shadow-lifted": "0 24px 60px rgba(26, 26, 24, 0.08)",
      "--site-font-display": FONT.spaceGrotesk,
      "--site-font-body": FONT.dmSans,
    },
  },
  {
    id: "editorial",
    name: "Editorial chapters",
    description:
      "Near-black shell with warm white type. Built for work that leads the story.",
    swatch: ["#0c0c0d", "#161617", "#f5f2ed"],
    vars: {
      "--site-background": "#0c0c0d",
      "--site-foreground": "#f5f2ed",
      "--site-surface": "#161617",
      "--site-surface-subtle": "#1d1d1f",
      "--site-border": "rgba(245, 242, 237, 0.14)",
      "--site-border-strong": "rgba(245, 242, 237, 0.3)",
      "--site-muted": "rgba(245, 242, 237, 0.6)",
      "--site-accent": "#f5f2ed",
      "--site-radius-card": "0.375rem",
      "--site-radius-pill": "999px",
      // Hairline rules over drop shadows, which don't read on near-black.
      "--site-shadow-soft": "inset 0 0 0 1px rgba(245, 242, 237, 0.06)",
      "--site-shadow-raised": "inset 0 0 0 1px rgba(245, 242, 237, 0.08)",
      "--site-shadow-lifted":
        "inset 0 0 0 1px rgba(245, 242, 237, 0.12), 0 32px 80px rgba(0, 0, 0, 0.6)",
      "--site-font-display": FONT.spaceGrotesk,
      "--site-font-body": FONT.workSans,
    },
  },
  {
    id: "warm",
    name: "Warm minimal",
    description:
      "Calm beige and cream with low-contrast structure. Light mode only, by design.",
    swatch: ["#f6f1e9", "#fffdf9", "#8a6a4b"],
    vars: {
      "--site-background": "#f6f1e9",
      "--site-foreground": "#2b2621",
      "--site-surface": "#fffdf9",
      "--site-surface-subtle": "#efe8dd",
      "--site-border": "rgba(43, 38, 33, 0.1)",
      "--site-border-strong": "rgba(43, 38, 33, 0.2)",
      "--site-muted": "rgba(43, 38, 33, 0.6)",
      "--site-accent": "#8a6a4b",
      "--site-radius-card": "0.75rem",
      "--site-radius-pill": "0.5rem",
      "--site-shadow-soft": "0 1px 2px rgba(69, 55, 40, 0.05)",
      "--site-shadow-raised": "0 2px 10px rgba(69, 55, 40, 0.06)",
      "--site-shadow-lifted": "0 18px 50px rgba(69, 55, 40, 0.1)",
      "--site-font-display": FONT.dmSans,
      "--site-font-body": FONT.dmSans,
    },
  },
  {
    // Ported from the B&C Resource design system: deep chocolate brown with
    // cream and amber gold, rounded shapes and brown-tinted shadows rather
    // than neutral black ones.
    id: "catering",
    name: "Warm hospitality",
    description:
      "Chocolate brown, cream and amber gold. Rounded and appetising — built for food and events.",
    swatch: ["#fbf6ee", "#ffffff", "#d99a3d"],
    vars: {
      "--site-background": "#fbf6ee",
      "--site-foreground": "#2a2017",
      "--site-surface": "#ffffff",
      "--site-surface-subtle": "#fdfaf4",
      "--site-border": "rgba(74, 44, 24, 0.14)",
      "--site-border-strong": "rgba(74, 44, 24, 0.26)",
      "--site-muted": "rgba(92, 81, 71, 0.95)",
      "--site-accent": "#d99a3d",
      // Generous radii — the original system rounds cards to 20px.
      "--site-radius-card": "1.25rem",
      "--site-radius-pill": "999px",
      // Warm, brown-tinted shadows; never harsh black.
      "--site-shadow-soft": "0 2px 6px rgba(74, 44, 24, 0.08)",
      "--site-shadow-raised": "0 8px 20px rgba(74, 44, 24, 0.1)",
      "--site-shadow-lifted": "0 16px 40px rgba(74, 44, 24, 0.14)",
      // Deep emerald, used by the Band block for the events strip.
      "--site-band": "#14573a",
      "--site-band-on": "#fdfaf4",
      "--site-font-display": FONT.baloo,
      "--site-font-body": FONT.nunito,
    },
  },

  {
    // Ported from the ECLAT design system: near-black on white with a cream
    // second surface and a gold accent. Square corners and almost no shadow —
    // luxury retail leans on type and space rather than chrome.
    id: "boutique",
    name: "Boutique",
    description:
      "Black, cream and gold with serif headings. Built for fashion and product-led shops.",
    swatch: ["#ffffff", "#f9f7f4", "#c9a86c"],
    vars: {
      "--site-background": "#ffffff",
      "--site-foreground": "#0a0a0a",
      "--site-surface": "#ffffff",
      "--site-surface-subtle": "#f9f7f4",
      "--site-border": "rgba(10, 10, 10, 0.12)",
      "--site-border-strong": "rgba(10, 10, 10, 0.28)",
      "--site-muted": "rgba(10, 10, 10, 0.58)",
      "--site-accent": "#c9a86c",
      "--site-band": "#0a0a0a",
      "--site-band-on": "#f9f7f4",
      "--site-radius-card": "0px",
      "--site-radius-pill": "0px",
      "--site-shadow-soft": "none",
      "--site-shadow-raised": "none",
      "--site-shadow-lifted": "0 24px 60px rgba(10, 10, 10, 0.1)",
      "--site-font-display": FONT.cormorant,
      "--site-font-body": FONT.inter,
    },
  },
];

export const DEFAULT_THEME_ID = "studio";

export function getTheme(id: string | null | undefined): SiteTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Inline style carrying a theme's custom properties. */
export function themeStyle(id: string | null | undefined): CSSProperties {
  return getTheme(id).vars as CSSProperties;
}
