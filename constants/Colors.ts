// /client/constants/Colors.ts

// ── Shared static colors (theme-independent) ───────────────────────────────
export default {
  primary: "#1877F2",
  grey: "#ECEBEB",
  dark: "#000000",
  white: "#FFFFFF",
  lightGrey: "#F4F4F4",
  light: "#F9F9F9",
  secondary: "#b0d9fc",
  seconderyLight: "#d9ecfe",
  lightBlue: "#f5f9fc",
  darkGrey: "#767676",
  blue: "#007AFF",
  littleDark: "#464646",
  littleDarkGrey: "#BDBDBD",
  lightGreen: "#edffe3",
  warningYellow: "#FEF9C3",
  green: "#22C55E",
  pendingYellow: "#FBBF24",
  greenText: "#10B981",
  yellowText: "#854D0E",
  shadowColor: "rgba(0,0,0,0.5)",
  shadowColor2: "#393939",
  containerColor: "#FFFFFF",
};

// ── Light Theme ────────────────────────────────────────────────────────────
export const LightTheme = {
  // ── Legacy (keep for backward compat) ──
  primary: "#1877F2",
  grey: "#ECEBEB",
  dark: "#000000",
  white: "#FFFFFF",
  lightGrey: "#F4F4F4",
  light: "#F9F9F9",
  secondary: "#b0d9fc",
  seconderyLight: "#d9ecfe",
  lightBlue: "#f5f9fc",
  darkGrey: "#767676",
  blue: "#007AFF",
  littleDark: "#464646",
  littleDarkGrey: "#BDBDBD",
  lightGreen: "#edffe3",
  warningYellow: "#FEF9C3",
  green: "#22C55E",
  pendingYellow: "#FBBF24",
  greenText: "#10B981",
  yellowText: "#854D0E",
  shadowColor: "rgba(0,0,0,0.12)",
  shadowColor2: "#C0C0C0",
  containerColor: "#FFFFFF",

  // ── Semantic (legacy names) ──
  backgroundColor: "#F0F2F5",
  themeColorTextPure: "#0D0F14",
  themeColorTextSecondary: "#4A4F5E",
  themeContainerGrey: "#E4E6EC",
  containerLittleGrey: "#ECEEF3",

  // ── Surface tiers (Velocity Light) ──
  surface: "#FFFFFF", // card background
  surfaceHigh: "#F2F4F8", // elevated inlays, section boxes
  surfaceHighest: "#E8EAF0", // highest elevation chips

  // ── Text ──
  onSurface: "#0D0F14", // primary text
  onSurfaceVariant: "#3A3F50", // body / value text
  outline: "#6B7280", // labels, icons, placeholders

  // ── Borders ──
  border: "rgba(0,0,0,0.08)", // card border
  borderSubtle: "rgba(0,0,0,0.05)", // inner dividers

  // ── Primary accent (booking app blue) ──
  accentPrimary: "#1877F2",
  accentPrimaryGlow: "rgba(24,119,242,0.10)",
  accentPrimaryBorder: "rgba(24,119,242,0.22)",

  // ── Feedback: Success ──
  successColor: "#16A34A",
  successGlow: "rgba(22,163,74,0.10)",
  successBorder: "rgba(22,163,74,0.22)",

  // ── Feedback: Warning ──
  warningColor: "#D97706",
  warningGlow: "rgba(217,119,6,0.10)",
  warningBorder: "rgba(217,119,6,0.22)",

  // ── Feedback: Error ──
  errorColor: "#DC2626",
  errorGlow: "rgba(220,38,38,0.10)",
  errorBorder: "rgba(220,38,38,0.22)",
} as const;

// ── Dark Theme ─────────────────────────────────────────────────────────────
export const DarkTheme = {
  // ── Legacy (keep for backward compat) ──
  primary: "#1877F2",
  grey: "#ECEBEB",
  dark: "#000000",
  white: "#FFFFFF",
  lightGrey: "#F4F4F4",
  light: "#F9F9F9",
  secondary: "#b0d9fc",
  seconderyLight: "#d9ecfe",
  lightBlue: "#f5f9fc",
  darkGrey: "#767676",
  blue: "#007AFF",
  littleDark: "#464646",
  littleDarkGrey: "#BDBDBD",
  lightGreen: "#edffe3",
  warningYellow: "#FEF9C3",
  green: "#22C55E",
  pendingYellow: "#FBBF24",
  greenText: "#10B981",
  yellowText: "#854D0E",
  shadowColor: "rgba(0,0,0,0.5)",
  shadowColor2: "#393939",
  containerColor: "#151a20",

  // ── Semantic (legacy names) ──
  backgroundColor: "#0e1218",
  themeColorTextPure: "#FFFFFF",
  themeColorTextSecondary: "#e5e5e5",
  themeContainerGrey: "#3c3f47",
  containerLittleGrey: "#323641",

  // ── Surface tiers (Velocity Dark) ──
  surface: "#1e2024", // card background
  surfaceHigh: "#282a2e", // elevated inlays, section boxes
  surfaceHighest: "#333539", // highest elevation chips

  // ── Text ──
  onSurface: "#e2e2e8", // primary text
  onSurfaceVariant: "#c1c6d7", // body / value text
  outline: "#8b90a0", // labels, icons, placeholders

  // ── Borders ──
  border: "rgba(255,255,255,0.07)", // card border
  borderSubtle: "rgba(255,255,255,0.05)", // inner dividers

  // ── Primary accent ──
  accentPrimary: "#adc6ff",
  accentPrimaryGlow: "rgba(173,198,255,0.10)",
  accentPrimaryBorder: "rgba(173,198,255,0.18)",

  // ── Feedback: Success ──
  successColor: "#69DB7C",
  successGlow: "rgba(105,219,124,0.10)",
  successBorder: "rgba(105,219,124,0.22)",

  // ── Feedback: Warning ──
  warningColor: "#FFD43B",
  warningGlow: "rgba(255,212,59,0.10)",
  warningBorder: "rgba(255,212,59,0.22)",

  // ── Feedback: Error ──
  errorColor: "#FF6B6B",
  errorGlow: "rgba(255,107,107,0.10)",
  errorBorder: "rgba(255,107,107,0.22)",
} as const;

// ── Convenience type (use anywhere you accept either theme) ────────────────
export type ThemeColors = typeof LightTheme | typeof DarkTheme;
