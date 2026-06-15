import { Check } from "lucide-react"
import type { Theme } from "../types"
import { THEMES } from "../assets/themes"

interface Props {
  current: Theme
  onChange: (theme: Theme) => void
}

export function ThemeSwitcher({ current, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {(Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]).map(
        ([key, def]) => {
          const active = current === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active
                  ? "border-accent shadow-lg"
                  : "border-border hover:border-text-secondary"
              }`}
              style={{ background: def.bg }}>
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20">
                <span
                  className="h-5 w-5 rounded-full"
                  style={{ background: def.preview }}
                />
                {active && (
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </div>
              <span
                className="text-[11px] font-medium"
                style={{
                  color:
                    key === "light" || key === "warm" ? "#0f172a" : "#e2e8f0"
                }}>
                {def.label}
              </span>
            </button>
          )
        }
      )}
    </div>
  )
}
