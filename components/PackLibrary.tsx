import { useState, useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useT } from "../contexts/I18nContext"
import type { PackCategory, PersonaPack, UserSettings } from "../types"
import { PACKS, PACK_CATEGORIES, ALL_PACKS, FREE_PACKS, isPackFree } from "../lib/packs"

const CATEGORY_ORDER: PackCategory[] = [
  "professional", "personal", "industry", "hobby", "meta"
]

interface Props {
  settings: UserSettings
  onSettingsChange: (s: Partial<UserSettings>) => void
}

export function PackLibrary({ settings, onSettingsChange }: Props) {
  const { t } = useT()
  const [search, setSearch] = useState("")
  const [moreOpen, setMoreOpen] = useState(false)

  const installed = new Set(settings.active_packs)
  const isPaid = settings.is_paid
  const q = search.toLowerCase().trim()

  function togglePack(id: PersonaPack) {
    if (!isPaid && !isPackFree(id)) return
    const next = new Set(installed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSettingsChange({ active_packs: Array.from(next) })
  }

  function matches(id: PersonaPack) {
    if (!q) return true
    const p = PACKS[id]
    if (!p) return false
    return p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || id.includes(q)
  }

  const visibleFree = useMemo(() => FREE_PACKS.filter(matches), [q])
  const visiblePro  = useMemo(() => ALL_PACKS.filter(id => !isPackFree(id) && matches(id)), [q])
  const isSearching = q.length > 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Template Library</h2>
        <p className="text-sm text-text-secondary mt-1">
          Pre-built rule packs. Install the ones that match how you work.
        </p>
      </div>

      <input
        type="text"
        placeholder="Search packs…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
      />

      {isSearching ? (
        <div className="flex flex-col gap-6">
          {visibleFree.length > 0 && (
            <div>
              <SectionLabel text="Available now" />
              <Grid packs={visibleFree} installed={installed} isPaid={isPaid} onToggle={togglePack} />
            </div>
          )}
          {visiblePro.length > 0 && (
            <div>
              <SectionLabel text="Requires Pro" dim />
              <Grid packs={visiblePro} installed={installed} isPaid={isPaid} onToggle={togglePack} />
            </div>
          )}
          {visibleFree.length === 0 && visiblePro.length === 0 && (
            <p className="text-sm text-text-secondary py-8 text-center">No packs match "{q}"</p>
          )}
        </div>
      ) : isPaid ? (
        /* Paid users — everything by category */
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.map(cat => {
            const meta = PACK_CATEGORIES[cat]
            return (
              <div key={cat}>
                <SectionLabel text={`${meta.emoji} ${t(`tmpl.cat.${cat}`)}`} />
                <Grid packs={meta.packs} installed={installed} isPaid={isPaid} onToggle={togglePack} />
              </div>
            )
          })}
        </div>
      ) : (
        /* Free users — available packs then more */
        <div className="flex flex-col gap-8">
          <div>
            <Grid packs={FREE_PACKS} installed={installed} isPaid={isPaid} onToggle={togglePack} />
          </div>

          {/* More packs accordion */}
          <div className="border-t border-border pt-6">
            <button
              onClick={() => setMoreOpen(v => !v)}
              className="flex w-full items-center justify-between text-left group"
            >
              <div>
                <span className="text-sm font-semibold text-text-primary">
                  More packs
                </span>
                <span className="ml-2 text-xs text-text-secondary">
                  {ALL_PACKS.length - FREE_PACKS.length} packs across every workflow
                </span>
              </div>
              {moreOpen
                ? <ChevronDown size={15} className="text-text-secondary" />
                : <ChevronRight size={15} className="text-text-secondary" />
              }
            </button>

            {moreOpen && (
              <div className="mt-5 flex flex-col gap-6">
                {CATEGORY_ORDER.map(cat => {
                  const meta = PACK_CATEGORIES[cat]
                  const proCatPacks = meta.packs.filter(p => !isPackFree(p))
                  if (proCatPacks.length === 0) return null
                  return (
                    <div key={cat}>
                      <SectionLabel text={`${meta.emoji} ${t(`tmpl.cat.${cat}`)}`} dim />
                      <Grid packs={proCatPacks} installed={installed} isPaid={isPaid} onToggle={togglePack} />
                    </div>
                  )
                })}

                <div className="rounded-xl border border-border bg-bg-secondary px-5 py-4">
                  <p className="text-sm font-medium text-text-primary">
                    Get all {ALL_PACKS.length - FREE_PACKS.length} packs with Pro
                  </p>
                  <p className="text-xs text-text-secondary mt-1 mb-3">
                    One upgrade unlocks everything — including new packs added later.
                  </p>
                  <button
                    className="rounded-lg px-4 py-1.5 text-sm font-semibold"
                    style={{ background: "#d4af37", color: "#000" }}>
                    View plans
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ text, dim }: { text: string; dim?: boolean }) {
  return (
    <p className={`mb-3 text-xs font-semibold uppercase tracking-widest ${dim ? "text-text-secondary opacity-60" : "text-text-secondary"}`}>
      {text}
    </p>
  )
}

function Grid({ packs, installed, isPaid, onToggle }: {
  packs: PersonaPack[]
  installed: Set<PersonaPack>
  isPaid: boolean
  onToggle: (id: PersonaPack) => void
}) {
  return (
    <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
      {packs.map(id => (
        <Card
          key={id}
          id={id}
          installed={installed.has(id)}
          locked={!isPaid && !isPackFree(id)}
          onToggle={() => onToggle(id)}
        />
      ))}
    </div>
  )
}

function Card({ id, installed, locked, onToggle }: {
  id: PersonaPack
  installed: boolean
  locked: boolean
  onToggle: () => void
}) {
  const { t } = useT()
  const pack = PACKS[id]
  if (!pack) return null

  return (
    <div
      className="flex flex-col gap-2 rounded-xl border p-3 transition-colors"
      style={{
        borderColor: installed ? "var(--accent)" : "var(--border)",
        background: installed ? "color-mix(in srgb, var(--accent) 6%, var(--surface))" : "var(--surface)",
        opacity: locked ? 0.55 : 1,
      }}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{pack.emoji}</span>
        <span className="text-[13px] font-semibold text-text-primary leading-tight">
          {t(`pack.${id}.name`)}
        </span>
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed flex-1">
        {t(`pack.${id}.desc`)}
      </p>

      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-text-secondary">{pack.rules.length} rules</span>
        {locked ? (
          <span className="text-[11px] text-text-secondary">Pro</span>
        ) : (
          <button
            onClick={onToggle}
            className="rounded-md px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              border: "1px solid",
              borderColor: installed ? "var(--border)" : "var(--accent)",
              background: installed ? "transparent" : "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: installed ? "var(--text-secondary)" : "var(--accent)",
              cursor: "pointer",
            }}>
            {installed ? "Remove" : "Install"}
          </button>
        )}
      </div>
    </div>
  )
}
