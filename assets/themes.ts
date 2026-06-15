import type { Theme } from "../types"

export interface ThemeDef {
  label: string
  preview: string
  bg: string
  vars: Record<string, string>
}

export const THEMES: Record<Theme, ThemeDef> = {
  dark: {
    label: "Dark",
    preview: "#e94560",
    bg: "#1a1a2e",
    vars: {
      "--bg-primary": "#1a1a2e",
      "--bg-secondary": "#16213e",
      "--bg-card": "#0f3460",
      "--text-primary": "#e2e8f0",
      "--text-secondary": "#94a3b8",
      "--accent": "#e94560",
      "--accent-hover": "#c73652",
      "--border": "#1e3a5f",
      "--success": "#10b981",
      "--warning": "#f59e0b"
    }
  },
  light: {
    label: "Light",
    preview: "#6366f1",
    bg: "#f8fafc",
    vars: {
      "--bg-primary": "#f8fafc",
      "--bg-secondary": "#f1f5f9",
      "--bg-card": "#ffffff",
      "--text-primary": "#0f172a",
      "--text-secondary": "#475569",
      "--accent": "#6366f1",
      "--accent-hover": "#4f46e5",
      "--border": "#e2e8f0",
      "--success": "#10b981",
      "--warning": "#f59e0b"
    }
  },
  midnight: {
    label: "Midnight",
    preview: "#a78bfa",
    bg: "#0d0d0d",
    vars: {
      "--bg-primary": "#0d0d0d",
      "--bg-secondary": "#141414",
      "--bg-card": "#1c1c1c",
      "--text-primary": "#f5f5f5",
      "--text-secondary": "#737373",
      "--accent": "#a78bfa",
      "--accent-hover": "#8b5cf6",
      "--border": "#262626",
      "--success": "#34d399",
      "--warning": "#fbbf24"
    }
  },
  forest: {
    label: "Forest",
    preview: "#4ade80",
    bg: "#0f1f0f",
    vars: {
      "--bg-primary": "#0f1f0f",
      "--bg-secondary": "#162216",
      "--bg-card": "#1e2e1e",
      "--text-primary": "#d4edda",
      "--text-secondary": "#86a98b",
      "--accent": "#4ade80",
      "--accent-hover": "#22c55e",
      "--border": "#2d4a2d",
      "--success": "#4ade80",
      "--warning": "#fbbf24"
    }
  },
  warm: {
    label: "Warm",
    preview: "#d97706",
    bg: "#fdf6ec",
    vars: {
      "--bg-primary": "#fdf6ec",
      "--bg-secondary": "#faebd7",
      "--bg-card": "#ffffff",
      "--text-primary": "#2c1810",
      "--text-secondary": "#7c5c4e",
      "--accent": "#d97706",
      "--accent-hover": "#b45309",
      "--border": "#e8d5b7",
      "--success": "#059669",
      "--warning": "#d97706"
    }
  }
}

export function applyTheme(theme: Theme): void {
  const { vars } = THEMES[theme]
  const root = document.documentElement
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value)
  }
}
