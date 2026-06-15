import { GripVertical, Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { PACKS } from "../lib/packs"
import type { Rule } from "../types"
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

const CONDITION_LABELS: Record<string, string> = {
  source_domain: "source is",
  filename_contains: "filename contains",
  file_extension: "file type is",
  url_contains: "URL contains",
  page_title_contains: "page title contains"
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
  const MAX_FREE_CUSTOM = 5

  if (rules.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-text-secondary">
        <p className="text-sm">No rules yet. Activate a pack or add a custom rule.</p>
        <Button onClick={onAdd} size="sm">
          <Plus size={14} /> Add Custom Rule
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {rules.map((rule) => {
        const packDef = rule.pack
          ? PACKS[rule.pack as keyof typeof PACKS]
          : null

        const conditionSummary = rule.conditions
          .slice(0, 2)
          .map((c) => {
            const label = CONDITION_LABELS[c.type] ?? c.type
            const values = c.values.slice(0, 2).join(", ")
            const more = c.values.length > 2 ? ` +${c.values.length - 2}` : ""
            return `${label} "${values}${more}"`
          })
          .join(` ${rule.condition_logic === "ANY" ? "or" : "and"} `)

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
                  title="Unlock drag reorder (Pro)"
                  className="text-text-secondary opacity-40 hover:opacity-70">
                  <Lock size={14} />
                </button>
              )}
            </div>

            {/* Rule info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-medium text-text-primary">
                  {rule.name}
                </span>
                {packDef ? (
                  <Badge color="muted">
                    {packDef.emoji} {packDef.label.split(" ")[0]}
                  </Badge>
                ) : (
                  <Badge color="accent">Custom</Badge>
                )}
              </div>
              {conditionSummary && (
                <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                  If {conditionSummary}
                </p>
              )}
              <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                → {rule.actions.move_to}
                {rule.actions.rename_to && ` · rename: ${rule.actions.rename_to}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <Toggle
                checked={rule.active}
                onChange={(v) => onToggle(rule.id, v)}
                label={rule.active ? "Disable rule" : "Enable rule"}
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
            {customCount}/{MAX_FREE_CUSTOM} custom rules used
          </p>
        )}
        <Button
          onClick={
            !isPaid && customCount >= MAX_FREE_CUSTOM ? onUpgrade : onAdd
          }
          size="sm"
          variant={
            !isPaid && customCount >= MAX_FREE_CUSTOM ? "secondary" : "primary"
          }
          className="ml-auto">
          {!isPaid && customCount >= MAX_FREE_CUSTOM ? (
            <>
              <Lock size={13} /> Upgrade for more rules
            </>
          ) : (
            <>
              <Plus size={13} /> Add Custom Rule
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
