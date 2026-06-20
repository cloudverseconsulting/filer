import { Folder, GripVertical, Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { PACKS } from "../lib/packs"
import { PRICING } from "../lib/pricing"
import type { Rule } from "../types"
import { useT } from "../contexts/I18nContext"
import { Badge, Button, Toggle } from "./ui"

interface Props {
  rules: Rule[]
  isPaid: boolean
  customCount: number
  onToggle: (id: string, active: boolean) => void
  onEdit: (rule: Rule) => void
  onDelete: (id: string) => void
  onAdd: () => void
  onUpgrade: () => void
}

export function RuleList({
  rules,
  isPaid,
  customCount,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  onUpgrade
}: Props) {
  const { t } = useT()
  const MAX_FREE_CUSTOM = PRICING.free.maxCustomRules

  const CONDITION_LABELS: Record<string, string> = {
    filename: t("rules.cond.filename_contains"),
    file_extension: t("rules.cond.file_extension"),
    source_domain: t("rules.cond.source_domain"),
    full_url: t("rules.cond.url_contains"),
    url_path: t("rules.cond.url_contains"),
    page_title: t("rules.cond.page_title_contains"),
    // legacy keys
    filename_contains: t("rules.cond.filename_contains"),
    url_contains: t("rules.cond.url_contains"),
    page_title_contains: t("rules.cond.page_title_contains"),
  }

  if (rules.length === 0) {
    const examples = [
      { name: "Stripe Invoices", folder: "Finance/Invoices/", cond: "stripe.com" },
      { name: "Design Files", folder: "Design/Assets/", cond: "*.fig, *.sketch" },
      { name: "Research PDFs", folder: "Research/Papers/", cond: "filename contains research" }
    ]
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-2 py-8 text-center text-text-secondary">
          <p className="text-sm">{t("rules.empty")}</p>
          <Button onClick={onAdd} size="sm">
            <Plus size={14} /> {t("rules.empty.cta")}
          </Button>
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-text-secondary px-1">Examples</p>
        <div className="flex flex-col gap-2 opacity-50 pointer-events-none select-none">
          {examples.map((ex) => (
            <div key={ex.name} className="flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-text-primary">{ex.name}</span>
                  <Badge color="accent">custom</Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-text-secondary">{t("rules.if")} {ex.cond}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-text-secondary">
                  <Folder size={10} className="text-accent flex-shrink-0" />
                  <span className="font-medium text-accent">{ex.folder}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {rules.map((rule) => {
        const packDef = rule.pack ? PACKS[rule.pack as keyof typeof PACKS] : null

        // Summarise the first group's first two conditions
        const firstGroup = rule.condition_groups[0]
        const conditionSummary = firstGroup
          ? firstGroup.conditions.slice(0, 2).map((c) => {
              const label = CONDITION_LABELS[c.field] ?? c.field.replace(/_/g, " ")
              const val = c.value.split(",").slice(0, 2).map(v => v.trim()).join(", ")
              return `${label} "${val}"`
            }).join(` ${firstGroup.logic === "OR" ? t("rules.logic.any") : t("rules.logic.and")} `)
          : ""

        return (
          <div
            key={rule.id}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 transition-colors hover:bg-bg-secondary">
            {/* Drag handle */}
            <div className="relative flex-shrink-0">
              {isPaid ? (
                <GripVertical
                  size={16}
                  className="cursor-grab text-text-secondary opacity-50 group-hover:opacity-100"
                />
              ) : (
                <button
                  onClick={onUpgrade}
                  title={t("rules.drag_pro")}
                  className="text-text-secondary opacity-40 hover:opacity-70">
                  <Lock size={14} />
                </button>
              )}
            </div>

            {/* Rule info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-text-primary">{rule.name}</span>
                {packDef ? (
                  <Badge color="muted">{packDef.emoji} {packDef.label.split(" ")[0]}</Badge>
                ) : (
                  <Badge color="accent">{t("rules.custom_badge")}</Badge>
                )}
              </div>
              {rule.actions.move_to && (
                <div className="mt-0.5 flex items-center gap-1 text-[11px]">
                  <Folder size={10} className="text-accent flex-shrink-0" />
                  <span className="font-medium text-accent truncate">{rule.actions.move_to}</span>
                </div>
              )}
              {conditionSummary && (
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                  {t("rules.if")} {conditionSummary}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Toggle
                checked={rule.active}
                onChange={(v) => onToggle(rule.id, v)}
                label={rule.active ? t("sidebar.paused") : t("sidebar.enabled")}
              />
              <button
                onClick={() => onEdit(rule)}
                className="text-text-secondary opacity-50 hover:opacity-100 hover:text-accent transition-colors">
                <Pencil size={14} />
              </button>
              {rule.is_custom && (
                <button
                  onClick={() => onDelete(rule.id)}
                  className="text-text-secondary opacity-50 hover:opacity-100 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Add custom rule */}
      <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
        {!isPaid && (
          <p className="text-xs text-text-secondary">
            {t("rules.free_limit", { n: customCount, max: MAX_FREE_CUSTOM })}
          </p>
        )}
        <Button
          onClick={!isPaid && customCount >= MAX_FREE_CUSTOM ? onUpgrade : onAdd}
          size="sm"
          variant={!isPaid && customCount >= MAX_FREE_CUSTOM ? "secondary" : "primary"}
          className="ml-auto">
          {!isPaid && customCount >= MAX_FREE_CUSTOM ? (
            <><Lock size={13} /> {t("rules.upgrade_cta")}</>
          ) : (
            <><Plus size={13} /> {t("rules.empty.cta")}</>
          )}
        </Button>
      </div>
    </div>
  )
}
