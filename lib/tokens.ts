/**
 * AEW Design Tokens — v1.0
 * Single source of truth. Change a value here → changes everywhere.
 * Never hardcode colors, font families, or spacing outside this file.
 */

export const C = {
  // Backgrounds
  bg:         "#0a0a0c",
  surface:    "#111115",
  surfaceLow: "#0d0d0f",
  surfaceHigh:"#1a1a22",

  // Borders
  border:       "#1e1e24",
  borderStrong: "#2a2a35",
  borderActive: "#6c63ff55",

  // Brand / Accent palette
  primary:  "#6c63ff",
  teal:     "#3ecfcf",
  red:      "#ff6b6b",
  yellow:   "#f9ca24",
  purple:   "#9a90ff",

  // Text scale
  textWhite:  "#ffffff",
  textBody:   "#aaaaaa",
  textDim:    "#888888",
  textMuted:  "#555555",
  textFaint:  "#333333",
} as const;

export const F = {
  mono: "monospace" as const,
  code: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" as const,
} as const;

export const R = {
  sm:   6,
  md:   8,
  lg:   10,
  xl:   14,
} as const;

/** Helper: color + alpha hex (e.g. alpha(C.primary, "22") → "#6c63ff22") */
export function alpha(hex: string, a: string) {
  return hex + a;
}
