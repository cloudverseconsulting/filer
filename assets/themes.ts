import type { Theme } from "../types"

export interface ThemeDef {
  label: string
  preview: string
  bg: string
  swatches: string[]
  pro?: boolean
  vars: Record<string, string>
}

export const THEMES: Record<Theme, ThemeDef> = {
  dark: {
    label: "Dark",
    preview: "#e94560",
    bg: "#1a1a2e",
    swatches: ["#1a1a2e", "#0f3460", "#e94560", "#e2e8f0"],
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
    swatches: ["#f8fafc", "#ffffff", "#6366f1", "#0f172a"],
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
    swatches: ["#0d0d0d", "#1c1c1c", "#a78bfa", "#f5f5f5"],
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
    swatches: ["#0f1f0f", "#1e2e1e", "#4ade80", "#d4edda"],
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
    swatches: ["#fdf6ec", "#ffffff", "#d97706", "#2c1810"],
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
  },

  // ── Pro themes ────────────────────────────────────────────────────────────────

  heroic: {
    label: "Heroic",
    preview: "#c9a227",
    bg: "#1a0a0a",
    pro: true,
    swatches: ["#1a0a0a", "#2d0f0f", "#c9a227", "#f5e6c8"],
    vars: {
      "--bg-primary": "#1a0a0a",
      "--bg-secondary": "#2d0f0f",
      "--bg-card": "#3d1414",
      "--text-primary": "#f5e6c8",
      "--text-secondary": "#b89a70",
      "--accent": "#c9a227",
      "--accent-hover": "#a88520",
      "--border": "#5c2020",
      "--success": "#4ade80",
      "--warning": "#ef4444"
    }
  },

  pixel_trainer: {
    label: "Pixel Trainer",
    preview: "#ffcc00",
    bg: "#1a1a2e",
    pro: true,
    swatches: ["#1a1a2e", "#cc0000", "#3b5bdb", "#ffcc00"],
    vars: {
      "--bg-primary": "#1a1a2e",
      "--bg-secondary": "#16213e",
      "--bg-card": "#0f1a3e",
      "--text-primary": "#ffffff",
      "--text-secondary": "#a0aec0",
      "--accent": "#ffcc00",
      "--accent-hover": "#e6b800",
      "--border": "#2d3a5e",
      "--success": "#3b5bdb",
      "--warning": "#cc0000"
    }
  },

  pitch: {
    label: "Pitch",
    preview: "#4ade80",
    bg: "#0a1f0a",
    pro: true,
    swatches: ["#0a1f0a", "#14361c", "#4ade80", "#ffffff"],
    vars: {
      "--bg-primary": "#0a1f0a",
      "--bg-secondary": "#0f2910",
      "--bg-card": "#14361c",
      "--text-primary": "#ffffff",
      "--text-secondary": "#86efac",
      "--accent": "#4ade80",
      "--accent-hover": "#22c55e",
      "--border": "#166534",
      "--success": "#86efac",
      "--warning": "#fbbf24"
    }
  },

  gridiron: {
    label: "Gridiron",
    preview: "#c8a97e",
    bg: "#1c1007",
    pro: true,
    swatches: ["#1c1007", "#3b2712", "#c8a97e", "#f5f0e8"],
    vars: {
      "--bg-primary": "#1c1007",
      "--bg-secondary": "#2a1a0a",
      "--bg-card": "#3b2712",
      "--text-primary": "#f5f0e8",
      "--text-secondary": "#c8a97e",
      "--accent": "#c8a97e",
      "--accent-hover": "#a88a62",
      "--border": "#5c3d1c",
      "--success": "#86efac",
      "--warning": "#f59e0b"
    }
  },

  whites: {
    label: "Whites",
    preview: "#16a34a",
    bg: "#f9fafb",
    pro: true,
    swatches: ["#f9fafb", "#ffffff", "#1e3a5f", "#16a34a"],
    vars: {
      "--bg-primary": "#f9fafb",
      "--bg-secondary": "#f3f4f6",
      "--bg-card": "#ffffff",
      "--text-primary": "#1e3a5f",
      "--text-secondary": "#4b5563",
      "--accent": "#16a34a",
      "--accent-hover": "#15803d",
      "--border": "#d1d5db",
      "--success": "#16a34a",
      "--warning": "#d97706"
    }
  },

  cyberpunk: {
    label: "Cyberpunk",
    preview: "#00f5ff",
    bg: "#0a0014",
    pro: true,
    swatches: ["#0a0014", "#160028", "#b500ff", "#00f5ff"],
    vars: {
      "--bg-primary": "#0a0014",
      "--bg-secondary": "#100020",
      "--bg-card": "#160028",
      "--text-primary": "#e0d0ff",
      "--text-secondary": "#9d7bea",
      "--accent": "#00f5ff",
      "--accent-hover": "#00c8d4",
      "--border": "#3d0070",
      "--success": "#00f5ff",
      "--warning": "#b500ff"
    }
  },

  arctic: {
    label: "Arctic",
    preview: "#7dd3fc",
    bg: "#f0f8ff",
    pro: true,
    swatches: ["#f0f8ff", "#ffffff", "#7dd3fc", "#1e3a5f"],
    vars: {
      "--bg-primary": "#f0f8ff",
      "--bg-secondary": "#e1f0fa",
      "--bg-card": "#ffffff",
      "--text-primary": "#0c2d48",
      "--text-secondary": "#3b7ea1",
      "--accent": "#0284c7",
      "--accent-hover": "#0369a1",
      "--border": "#bae6fd",
      "--success": "#0d9488",
      "--warning": "#f59e0b"
    }
  },

  ember: {
    label: "Ember",
    preview: "#f97316",
    bg: "#1a0e07",
    pro: true,
    swatches: ["#1a0e07", "#2d1a0a", "#f97316", "#fde8d0"],
    vars: {
      "--bg-primary": "#1a0e07",
      "--bg-secondary": "#251506",
      "--bg-card": "#2d1a0a",
      "--text-primary": "#fde8d0",
      "--text-secondary": "#c4834a",
      "--accent": "#f97316",
      "--accent-hover": "#ea6c0b",
      "--border": "#5c2d0e",
      "--success": "#4ade80",
      "--warning": "#fbbf24"
    }
  },

  sakura: {
    label: "Sakura",
    preview: "#f472b6",
    bg: "#fff5f7",
    pro: true,
    swatches: ["#fff5f7", "#ffffff", "#f472b6", "#86efac"],
    vars: {
      "--bg-primary": "#fff5f7",
      "--bg-secondary": "#ffe8ef",
      "--bg-card": "#ffffff",
      "--text-primary": "#4a1028",
      "--text-secondary": "#9d4b6e",
      "--accent": "#f472b6",
      "--accent-hover": "#ec4899",
      "--border": "#fcc9d8",
      "--success": "#86efac",
      "--warning": "#f59e0b"
    }
  },

  terminal: {
    label: "Terminal",
    preview: "#00ff41",
    bg: "#000000",
    pro: true,
    swatches: ["#000000", "#0a0a0a", "#00ff41", "#00b32c"],
    vars: {
      "--bg-primary": "#000000",
      "--bg-secondary": "#080808",
      "--bg-card": "#0d0d0d",
      "--text-primary": "#00ff41",
      "--text-secondary": "#00b32c",
      "--accent": "#00ff41",
      "--accent-hover": "#00cc34",
      "--border": "#003d0f",
      "--success": "#00ff41",
      "--warning": "#ffff00"
    }
  },

  obsidian: {
    label: "Obsidian",
    preview: "#d4af37",
    bg: "#050505",
    pro: true,
    swatches: ["#050505", "#111111", "#d4af37", "#e8e0d0"],
    vars: {
      "--bg-primary": "#050505",
      "--bg-secondary": "#0d0d0d",
      "--bg-card": "#141414",
      "--text-primary": "#e8e0d0",
      "--text-secondary": "#7a7060",
      "--accent": "#d4af37",
      "--accent-hover": "#b8952e",
      "--border": "#2a2520",
      "--success": "#4ade80",
      "--warning": "#f59e0b"
    }
  },

  desert: {
    label: "Desert",
    preview: "#c2703c",
    bg: "#f5e6d0",
    pro: true,
    swatches: ["#f5e6d0", "#e8d0b0", "#c2703c", "#7a3b1e"],
    vars: {
      "--bg-primary": "#f5e6d0",
      "--bg-secondary": "#ead8bc",
      "--bg-card": "#f9eed8",
      "--text-primary": "#3d1c08",
      "--text-secondary": "#8b5e3c",
      "--accent": "#c2703c",
      "--accent-hover": "#a85c30",
      "--border": "#d4b48c",
      "--success": "#5a7c3c",
      "--warning": "#d97706"
    }
  },

  ocean: {
    label: "Ocean",
    preview: "#22d3ee",
    bg: "#020b18",
    pro: true,
    swatches: ["#020b18", "#0a2340", "#22d3ee", "#2dd4bf"],
    vars: {
      "--bg-primary": "#020b18",
      "--bg-secondary": "#041526",
      "--bg-card": "#0a2340",
      "--text-primary": "#e0f2fe",
      "--text-secondary": "#7ec8d4",
      "--accent": "#22d3ee",
      "--accent-hover": "#0891b2",
      "--border": "#0e3a5c",
      "--success": "#2dd4bf",
      "--warning": "#f59e0b"
    }
  },

  neon_night: {
    label: "Neon Night",
    preview: "#e879f9",
    bg: "#0d0d1a",
    pro: true,
    swatches: ["#0d0d1a", "#16163a", "#3b82f6", "#e879f9"],
    vars: {
      "--bg-primary": "#0d0d1a",
      "--bg-secondary": "#12122a",
      "--bg-card": "#16163a",
      "--text-primary": "#e8e0ff",
      "--text-secondary": "#8b80c0",
      "--accent": "#e879f9",
      "--accent-hover": "#d946ef",
      "--border": "#2a2860",
      "--success": "#3b82f6",
      "--warning": "#e879f9"
    }
  },

  vintage: {
    label: "Vintage",
    preview: "#8b6346",
    bg: "#f4ead8",
    pro: true,
    swatches: ["#f4ead8", "#e8d8bc", "#8b6346", "#2c1a0e"],
    vars: {
      "--bg-primary": "#f4ead8",
      "--bg-secondary": "#e8d8bc",
      "--bg-card": "#f9f0e0",
      "--text-primary": "#2c1a0e",
      "--text-secondary": "#6b4e35",
      "--accent": "#8b6346",
      "--accent-hover": "#704f38",
      "--border": "#c8b090",
      "--success": "#5a7c3c",
      "--warning": "#c2703c"
    }
  },
}

export function applyTheme(theme: Theme): void {
  const def = THEMES[theme]
  if (!def) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(def.vars)) {
    root.style.setProperty(key, value)
  }
}
