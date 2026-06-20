import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { PACKS } from "../lib/packs"
import type { PersonaPack } from "../types"
import { useT } from "../contexts/I18nContext"
import { Badge, Toggle } from "./ui"

interface Props {
  pack: PersonaPack
  active: boolean
  onToggle: (pack: PersonaPack) => void
  locked?: boolean
  onLockedClick?: () => void
}

export function PackCard({ pack, active, onToggle, locked, onLockedClick }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useT()
  const def = PACKS[pack]

  function handleToggle() {
    if (locked) {
      onLockedClick?.()
      return
    }
    onToggle(pack)
  }

  const rulesCount = def.rules.length
  const rulesLabel = `${rulesCount} ${t("common.rules")}`

  return (
    <div
      className={`bg-bg-card rounded-xl border transition-all ${
        active ? "border-accent" : "border-border"
      }`}>
      <div className="flex items-start gap-3 p-4">
        <span className="mt-0.5 text-2xl">{def.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                {t(`pack.${pack}.name`)}
              </span>
              {active && <Badge color="accent">{t("common.active")}</Badge>}
              {locked && <Badge color="warning">{t("common.pro")}</Badge>}
            </div>
            <Toggle checked={active} onChange={handleToggle} disabled={locked} />
          </div>
          <p className="mt-1 text-xs text-text-secondary">{t(`pack.${pack}.desc`)}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-text-secondary">{rulesLabel}</span>
            {rulesCount > 0 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-0.5 text-[11px] text-accent hover:underline">
                {expanded ? (
                  <>
                    {t("pack.hide_rules")} <ChevronUp size={11} />
                  </>
                ) : (
                  <>
                    {t("pack.view_rules")} <ChevronDown size={11} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {expanded && rulesCount > 0 && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="flex flex-col gap-2">
            {def.rules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text-primary">{rule.name}</div>
                  <div className="text-[11px] text-text-secondary">→ {rule.actions.move_to}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
