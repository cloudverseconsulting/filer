import { useState, useMemo } from "react"
import type { PackCategory, PersonaPack, UserSettings } from "../types"
import { PACKS, PACK_CATEGORIES, ALL_PACKS } from "../lib/packs"
import { Lock } from "lucide-react"

const MAX_FREE_PACKS = 3

const CATEGORY_ORDER: PackCategory[] = [
  "professional", "personal", "industry", "hobby", "meta"
]

interface Props {
  settings: UserSettings
  onSettingsChange: (s: Partial<UserSettings>) => void
}

export function PackLibrary({ settings, onSettingsChange }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<PackCategory | "all">("all")

  const installed = new Set(settings.active_packs)
  const isPaid = settings.is_paid
  const atLimit = !isPaid && installed.size >= MAX_FREE_PACKS

  const filteredPacks = useMemo<PersonaPack[]>(() => {
    const q = search.toLowerCase()
    return ALL_PACKS.filter((id) => {
      const pack = PACKS[id]
      if (!pack) return false
      if (activeCategory !== "all" && pack.category !== activeCategory) return false
      if (q) {
        return (
          pack.label.toLowerCase().includes(q) ||
          pack.description.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [search, activeCategory])

  function togglePack(id: PersonaPack) {
    const next = new Set(installed)
    if (next.has(id)) {
      next.delete(id)
    } else {
      if (atLimit) return
      next.add(id)
    }
    onSettingsChange({ active_packs: Array.from(next) })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 style={{ color: "var(--text-primary)", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
          Template Library
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {ALL_PACKS.length} persona packs — each pre-wired with rules for your workflow.{" "}
          {!isPaid && (
            <span style={{ color: "var(--gold)" }}>
              Free plan: {installed.size}/{MAX_FREE_PACKS} active.
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search packs…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          color: "var(--text-primary)",
          fontSize: 14,
          outline: "none",
        }}
      />

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <CategoryTab
          label="All"
          emoji="🗂️"
          active={activeCategory === "all"}
          count={ALL_PACKS.length}
          onClick={() => setActiveCategory("all")}
        />
        {CATEGORY_ORDER.map((cat) => {
          const meta = PACK_CATEGORIES[cat]
          return (
            <CategoryTab
              key={cat}
              label={meta.label}
              emoji={meta.emoji}
              active={activeCategory === cat}
              count={meta.packs.length}
              onClick={() => setActiveCategory(cat)}
            />
          )
        })}
      </div>

      {/* Results count */}
      <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
        {filteredPacks.length} pack{filteredPacks.length !== 1 ? "s" : ""}
        {search ? ` matching "${search}"` : ""}
      </p>

      {/* Grid */}
      {activeCategory === "all" && !search
        ? (
          // Grouped by category when browsing "All" without search
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((cat) => {
              const catMeta = PACK_CATEGORIES[cat]
              const catPacks = catMeta.packs.filter((p) => filteredPacks.includes(p))
              if (catPacks.length === 0) return null
              return (
                <div key={cat}>
                  <h3 style={{ color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                    {catMeta.emoji} {catMeta.label}
                  </h3>
                  <PackGrid packs={catPacks} installed={installed} atLimit={atLimit} isPaid={isPaid} onToggle={togglePack} />
                </div>
              )
            })}
          </div>
        )
        : (
          <PackGrid packs={filteredPacks} installed={installed} atLimit={atLimit} isPaid={isPaid} onToggle={togglePack} />
        )
      }
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CategoryTab({ label, emoji, active, count, onClick }: {
  label: string; emoji: string; active: boolean; count: number; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 20,
        border: "1px solid",
        borderColor: active ? "var(--gold)" : "var(--border)",
        background: active ? "var(--gold)" : "var(--surface)",
        color: active ? "#000" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span style={{ opacity: 0.65, fontSize: 11 }}>({count})</span>
    </button>
  )
}

function PackGrid({ packs, installed, atLimit, isPaid, onToggle }: {
  packs: PersonaPack[]
  installed: Set<PersonaPack>
  atLimit: boolean
  isPaid: boolean
  onToggle: (id: PersonaPack) => void
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: 10,
    }}>
      {packs.map((id) => (
        <PackCard
          key={id}
          id={id}
          installed={installed.has(id)}
          locked={!installed.has(id) && atLimit && !isPaid}
          onToggle={() => onToggle(id)}
        />
      ))}
    </div>
  )
}

function PackCard({ id, installed, locked, onToggle }: {
  id: PersonaPack
  installed: boolean
  locked: boolean
  onToggle: () => void
}) {
  const pack = PACKS[id]
  if (!pack) return null

  return (
    <div style={{
      position: "relative",
      borderRadius: 10,
      border: "1px solid",
      borderColor: installed ? "var(--gold)" : "var(--border)",
      background: installed ? "color-mix(in srgb, var(--gold) 8%, var(--surface))" : "var(--surface)",
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
      transition: "border-color 0.15s",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{pack.emoji}</span>
          <span style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            {pack.label}
          </span>
        </div>
        {installed && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
            color: "var(--gold)", whiteSpace: "nowrap"
          }}>Active</span>
        )}
      </div>

      {/* Description */}
      <p style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.5, margin: 0 }}>
        {pack.description}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          {pack.rules.length} rule{pack.rules.length !== 1 ? "s" : ""}
        </span>
        {locked ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", fontSize: 12 }}>
            <Lock size={12} />
            <span>Upgrade</span>
          </div>
        ) : (
          <button
            onClick={onToggle}
            style={{
              padding: "4px 12px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: installed ? "var(--border)" : "var(--gold)",
              background: installed ? "transparent" : "var(--gold)",
              color: installed ? "var(--text-secondary)" : "#000",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {installed ? "Remove" : "Install"}
          </button>
        )}
      </div>
    </div>
  )
}
