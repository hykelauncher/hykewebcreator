// Original, hand-authored CSS gradients used as default visuals across
// templates and blocks. Deliberately no third-party stock photography —
// avoids any licensing/copyright risk for generated sites.
export const GRADIENTS = {
  sunset: "linear-gradient(135deg, #f97316, #ec4899, #8b5cf6)",
  ocean: "linear-gradient(135deg, #0ea5e9, #06b6d4, #0f172a)",
  forest: "linear-gradient(135deg, #22c55e, #059669, #022c22)",
  grape: "linear-gradient(135deg, #a855f7, #db2777, #1e1b4b)",
  midnight: "linear-gradient(135deg, #334155, #0f172a, #000000)",
  rose: "linear-gradient(135deg, #fb7185, #f43f5e, #7f1d1d)",
} as const;

export type GradientTheme = keyof typeof GRADIENTS;

export const GRADIENT_OPTIONS = (
  Object.keys(GRADIENTS) as GradientTheme[]
).map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1),
  value,
}));

export function heroBackground(theme: GradientTheme, image?: string) {
  if (image) {
    return {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 45%), ${GRADIENTS[theme]}`,
  };
}
