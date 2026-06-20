import { Check, ChevronDown, ChevronRight, Lock } from "lucide-react"
import { useState } from "react"
import type { Theme } from "../types"
import { THEMES } from "../assets/themes"
import { useT } from "../contexts/I18nContext"

interface Props {
  current: Theme
  onChange: (theme: Theme) => void
  isPaid?: boolean
  onLockedClick?: () => void
}

export function ThemeSwitcher({ current, onChange, isPaid = false, onLockedClick }: Props) {
  const { t } = useT()
  const [proExpanded, setProExpanded] = useState(false)

  const allThemes = Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]
  const freeThemes = allThemes.filter(([, def]) => !def.pro)
  const proThemes = allThemes.filter(([, def]) => def.pro)

  function renderTheme([key, def]: [Theme, (typeof THEMES)[Theme]]) {
    const active = current === key
    const locked = def.pro && !isPaid
    const isLight = ["light", "warm", "arctic", "whites", "sakura", "desert", "vintage"].includes(key)

    function handleClick() {
      if (locked) onLockedClick?.()
      else onChange(key)
    }

    return (
      <button
        key={key}
        onClick={handleClick}
        title={locked ? t("theme.locked_tip") : def.label}
        className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active
            ? "border-accent shadow-lg"
            : locked
            ? "border-border opacity-80 hover:opacity-100"
            : "border-border hover:border-text-secondary"
        }`}
        style={{ background: def.bg }}>

        {locked && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="flex flex-col items-center gap-0.5">
              <Lock size={12} style={{ color: "#d4af37" }} />
              <span style={{ color: "#d4af37", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>
                {t("theme.pro_badge")}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-0.5 rounded overflow-hidden w-full h-4">
          {def.swatches.map((color, i) => (
            <div key={i} className="flex-1" style={{ background: color }} />
          ))}
        </div>

        {active && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
            <Check size={10} strokeWidth={3} />
          </span>
        )}

        <span
          className="text-[10px] font-medium truncate w-full text-center"
          style={{ color: isLight ? "#0f172a" : "#e2e8f0" }}>
          {def.label}
        </span>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-5 gap-3">
        {freeThemes.map(renderTheme)}
      </div>

      <button
        onClick={() => setProExpanded((v) => !v)}
        className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
        {proExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={{ color: "#d4af37" }}>Pro</span>
        <span>themes — {proThemes.length} more</span>
      </button>

      {proExpanded && (
        <div className="grid grid-cols-5 gap-3">
          {proThemes.map(renderTheme)}
        </div>
      )}
    </div>
  )
}
