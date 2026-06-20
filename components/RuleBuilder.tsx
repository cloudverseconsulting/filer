import { GripVertical, Plus, Trash2, X } from "lucide-react"
import { useRef, useState } from "react"
import type {
  ConditionField,
  ConditionGroup,
  ConditionOperator,
  Rule,
  RuleCondition
} from "../types"
import { Badge, Button, Modal } from "./ui"

interface Props {
  existingRule?: Rule
  isPaid: boolean
  onSave: (rule: Rule) => void
  onClose: () => void
}

// ── Field definitions ─────────────────────────────────────────────────────────

interface FieldDef {
  label: string
  group: string
  pro?: boolean
  placeholder: (op: ConditionOperator) => string
  operators: ConditionOperator[]
  valueType: "text" | "tags" | "number" | "day_picker" | "hour_picker"
}

const FIELDS: Record<ConditionField, FieldDef> = {
  filename: {
    label: "Filename",
    group: "File",
    placeholder: (op) =>
      op === "matches_regex" ? "e.g. invoice[0-9]+" :
      op === "starts_with" ? "e.g. report_" :
      op === "ends_with" ? "e.g. _final" :
      "e.g. invoice, receipt",
    operators: ["contains", "not_contains", "contains_any_of", "starts_with", "ends_with", "equals", "not_equals", "matches_regex"],
    valueType: "text",
  },
  file_extension: {
    label: "File extension",
    group: "File",
    placeholder: () => "e.g. .pdf, .xlsx, .docx",
    operators: ["is_any_of", "equals", "not_equals", "is_none_of"],
    valueType: "tags",
  },
  file_size: {
    label: "File size (MB)",
    group: "File",
    pro: true,
    placeholder: () => "e.g. 10",
    operators: ["gt", "lt"],
    valueType: "number",
  },
  mime_type: {
    label: "MIME type",
    group: "File",
    pro: true,
    placeholder: () => "e.g. application/pdf, image/",
    operators: ["equals", "starts_with", "is_any_of", "contains"],
    valueType: "tags",
  },
  source_domain: {
    label: "Source domain",
    group: "Source",
    placeholder: (op) =>
      op === "contains" ? "e.g. google" :
      "e.g. stripe.com, paypal.com",
    operators: ["is_any_of", "equals", "not_equals", "contains", "is_none_of"],
    valueType: "tags",
  },
  full_url: {
    label: "Full URL",
    group: "Source",
    placeholder: () => "e.g. /invoice/, checkout",
    operators: ["contains", "not_contains", "contains_any_of", "starts_with", "matches_regex"],
    valueType: "text",
  },
  url_path: {
    label: "URL path",
    group: "Source",
    placeholder: () => "e.g. /reports/, /export",
    operators: ["contains", "not_contains", "starts_with", "equals", "contains_any_of"],
    valueType: "text",
  },
  referrer_domain: {
    label: "Referrer domain",
    group: "Source",
    pro: true,
    placeholder: () => "e.g. notion.so, slack.com",
    operators: ["is_any_of", "equals", "not_equals"],
    valueType: "tags",
  },
  page_title: {
    label: "Page title",
    group: "Context",
    placeholder: (op) =>
      op === "starts_with" ? "e.g. Invoice" :
      "e.g. invoice, report, receipt",
    operators: ["contains", "not_contains", "contains_any_of", "starts_with", "equals", "matches_regex"],
    valueType: "text",
  },
  download_hour: {
    label: "Hour of download",
    group: "Time",
    pro: true,
    placeholder: () => "0–23",
    operators: ["gt", "lt", "equals"],
    valueType: "hour_picker",
  },
  download_day: {
    label: "Day of week",
    group: "Time",
    pro: true,
    placeholder: () => "",
    operators: ["is_any_of", "equals"],
    valueType: "day_picker",
  },
}

const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  contains:        "contains",
  not_contains:    "doesn't contain",
  contains_any_of: "contains any of",
  contains_all_of: "contains all of",
  starts_with:     "starts with",
  ends_with:       "ends with",
  equals:          "is exactly",
  not_equals:      "is not",
  is_any_of:       "is any of",
  is_none_of:      "is none of",
  matches_regex:   "matches regex",
  gt:              "is greater than",
  lt:              "is less than",
}

const PRO_OPERATORS: ConditionOperator[] = ["contains_all_of", "is_none_of", "matches_regex"]

// ── Rename tokens ─────────────────────────────────────────────────────────────

const FREE_TOKENS = [
  { token: "[page_title]", hint: "Smart page title" },
  { token: "[domain]",     hint: "Source domain name" },
  { token: "[date]",       hint: "Full date (your format)" },
  { token: "[YYYY]",       hint: "Year" },
  { token: "[MM]",         hint: "Month" },
  { token: "[DD]",         hint: "Day" },
  { token: "[original]",   hint: "Original filename" },
  { token: "[ext]",        hint: "Extension (no dot)" },
]

const PRO_TOKENS = [
  { token: "[YYYY-MM-DD]", hint: "ISO date" },
  { token: "[YYYY-MM]",    hint: "Year-month" },
  { token: "[source_path]",hint: "URL path segment" },
]

const SAMPLE_VALUES: Record<string, string> = {
  "[page_title]":  "Q2_Revenue_Report",
  "[domain]":      "Stripe",
  "[date]":        new Date().toISOString().split("T")[0],
  "[YYYY]":        String(new Date().getFullYear()),
  "[MM]":          String(new Date().getMonth() + 1).padStart(2, "0"),
  "[DD]":          String(new Date().getDate()).padStart(2, "0"),
  "[YYYY-MM-DD]":  new Date().toISOString().split("T")[0],
  "[YYYY-MM]":     new Date().toISOString().slice(0, 7),
  "[original]":    "q2_revenue_report",
  "[ext]":         "pdf",
  "[source_path]": "exports",
}

function previewFilename(template: string): string {
  let out = template
  for (const [token, val] of Object.entries(SAMPLE_VALUES)) {
    out = out.replaceAll(token, val)
  }
  return out + ".pdf"
}

// ── Blank factories ───────────────────────────────────────────────────────────

function blankCondition(): RuleCondition {
  return { id: crypto.randomUUID(), field: "filename", operator: "contains", value: "" }
}

function blankGroup(): ConditionGroup {
  return { id: crypto.randomUUID(), logic: "AND", conditions: [blankCondition()] }
}

function blankRule(): Partial<Rule> {
  return {
    name: "",
    active: true,
    priority: 99,
    condition_groups: [blankGroup()],
    actions: { rename_to: "[page_title]_[date]", move_to: "" },
    is_custom: true,
    created_at: new Date().toISOString(),
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function RuleBuilder({ existingRule, isPaid, onSave, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [rule, setRule] = useState<Partial<Rule>>(existingRule ?? blankRule())
  const renameRef = useRef<HTMLInputElement>(null)

  const groups: ConditionGroup[] = rule.condition_groups ?? [blankGroup()]

  // ── Group mutations ─────────────────────────────────────────────────────────

  function updateGroups(next: ConditionGroup[]) {
    setRule({ ...rule, condition_groups: next })
  }

  function addGroup() {
    updateGroups([...groups, blankGroup()])
  }

  function removeGroup(gi: number) {
    if (groups.length <= 1) return
    updateGroups(groups.filter((_, i) => i !== gi))
  }

  function setGroupLogic(gi: number, logic: "AND" | "OR") {
    updateGroups(groups.map((g, i) => i === gi ? { ...g, logic } : g))
  }

  function addCondition(gi: number) {
    updateGroups(groups.map((g, i) =>
      i === gi ? { ...g, conditions: [...g.conditions, blankCondition()] } : g
    ))
  }

  function removeCondition(gi: number, ci: number) {
    const g = groups[gi]
    if (g.conditions.length <= 1) { removeGroup(gi); return }
    updateGroups(groups.map((g, i) =>
      i === gi ? { ...g, conditions: g.conditions.filter((_, j) => j !== ci) } : g
    ))
  }

  function updateCondition(gi: number, ci: number, patch: Partial<RuleCondition>) {
    updateGroups(groups.map((g, i) =>
      i !== gi ? g : {
        ...g,
        conditions: g.conditions.map((c, j) =>
          j !== ci ? c : { ...c, ...patch }
        )
      }
    ))
  }

  // ── Token insertion ─────────────────────────────────────────────────────────

  function insertToken(token: string) {
    const input = renameRef.current
    if (!input) return
    const start = input.selectionStart ?? (rule.actions?.rename_to ?? "").length
    const end = input.selectionEnd ?? start
    const current = rule.actions?.rename_to ?? ""
    const next = current.slice(0, start) + token + current.slice(end)
    setRule({ ...rule, actions: { ...rule.actions!, rename_to: next } })
    requestAnimationFrame(() => {
      input.setSelectionRange(start + token.length, start + token.length)
      input.focus()
    })
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function canAdvance(): boolean {
    if (step === 1) return (rule.name?.trim().length ?? 0) > 0
    if (step === 2) return groups.some((g) => g.conditions.some((c) => c.value.trim()))
    if (step === 3) return (rule.actions?.move_to?.trim().length ?? 0) > 0
    return true
  }

  function handleSave() {
    const final: Rule = {
      id: existingRule?.id ?? crypto.randomUUID(),
      name: rule.name!.trim(),
      description: rule.description,
      pack: rule.pack,
      active: rule.active ?? true,
      priority: rule.priority ?? 99,
      condition_groups: groups,
      actions: rule.actions!,
      is_custom: true,
      created_at: rule.created_at ?? new Date().toISOString(),
    }
    onSave(final)
  }

  const renameTemplate = rule.actions?.rename_to ?? ""
  const folderTemplate = rule.actions?.move_to ?? ""
  const STEPS = ["Name", "Conditions", "Actions", "Preview"]

  return (
    <Modal onClose={onClose} title={existingRule ? "Edit Rule" : "New Rule"} wide>
      {/* Step indicator */}
      <div className="flex items-center gap-0 border-b border-border px-6 py-3">
        {STEPS.map((title, i) => {
          const num = i + 1
          const done = num < step
          const current = num === step
          return (
            <div key={title} className="flex items-center">
              <button
                onClick={() => num < step && setStep(num)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  current ? "text-accent" : done ? "text-success cursor-pointer" : "text-text-secondary"
                }`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  current ? "bg-accent text-white" : done ? "bg-success text-white" : "bg-border text-text-secondary"
                }`}>
                  {done ? "✓" : num}
                </span>
                {title}
              </button>
              {i < STEPS.length - 1 && <div className="mx-3 h-px w-8 bg-border" />}
            </div>
          )
        })}
      </div>

      <div className="p-6 overflow-y-auto max-h-[520px]">

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">Give your rule a name you'll recognise.</p>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Rule name</label>
              <input
                autoFocus
                value={rule.name ?? ""}
                onChange={(e) => setRule({ ...rule, name: e.target.value })}
                placeholder="e.g. Stripe Receipts"
                className="w-full rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Description <span className="opacity-50">(optional)</span></label>
              <input
                value={rule.description ?? ""}
                onChange={(e) => setRule({ ...rule, description: e.target.value })}
                placeholder="What does this rule do?"
                className="w-full rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        )}

        {/* ── Step 2: Conditions ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              Build conditions. Groups are joined by <strong>OR</strong> — the rule fires when any one group fully matches.
            </p>

            {groups.map((group, gi) => (
              <div key={group.id}>
                {/* OR separator between groups */}
                {gi > 0 && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider">or</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}

                <div className="rounded-xl border border-border bg-bg-card p-4">
                  {/* Group header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">Match</span>
                      <div className="flex rounded-md border border-border overflow-hidden">
                        {(["AND", "OR"] as const).map((l) => (
                          <button
                            key={l}
                            onClick={() => setGroupLogic(gi, l)}
                            className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              group.logic === l
                                ? "bg-accent text-white"
                                : "bg-bg-secondary text-text-secondary hover:bg-bg-card"
                            }`}>
                            {l}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {group.logic === "AND" ? "— all conditions must match" : "— any condition can match"}
                      </span>
                    </div>
                    {groups.length > 1 && (
                      <button onClick={() => removeGroup(gi)} className="text-text-secondary hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Condition rows */}
                  <div className="flex flex-col gap-2">
                    {group.conditions.map((cond, ci) => (
                      <ConditionRow
                        key={cond.id}
                        condition={cond}
                        isPaid={isPaid}
                        showConnector={ci < group.conditions.length - 1}
                        connectorLabel={group.logic}
                        onChange={(patch) => updateCondition(gi, ci, patch)}
                        onRemove={() => removeCondition(gi, ci)}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => addCondition(gi)}
                    className="mt-3 flex items-center gap-1 text-xs text-accent hover:underline">
                    <Plus size={12} /> Add condition
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addGroup}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors border border-dashed border-border rounded-lg px-3 py-2.5">
              <Plus size={13} />
              Add another group <span className="text-accent font-semibold">(OR)</span>
            </button>
          </div>
        )}

        {/* ── Step 3: Actions ── */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-secondary">What should happen when this rule fires?</p>

            {/* Skip rename toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setRule({ ...rule, actions: { ...rule.actions!, skip_rename: !rule.actions?.skip_rename } })}
                className={`relative h-5 w-9 rounded-full transition-colors ${rule.actions?.skip_rename ? "bg-accent" : "bg-border"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow ${rule.actions?.skip_rename ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-text-primary">Move only (skip rename)</p>
                <p className="text-[11px] text-text-secondary">Keep the original filename, just route to folder</p>
              </div>
            </label>

            {/* Rename template */}
            {!rule.actions?.skip_rename && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-secondary">Rename template</label>
                <input
                  ref={renameRef}
                  value={renameTemplate}
                  onChange={(e) => setRule({ ...rule, actions: { ...rule.actions!, rename_to: e.target.value } })}
                  placeholder="[page_title]_[date]"
                  className="rounded-md border border-border bg-bg-card px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />

                {/* Free tokens */}
                <div className="flex flex-wrap gap-1.5">
                  {FREE_TOKENS.map(({ token, hint }) => (
                    <button
                      key={token}
                      onClick={() => insertToken(token)}
                      title={hint}
                      className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[11px] text-accent hover:bg-accent/20 transition-colors">
                      {token}
                    </button>
                  ))}
                  {PRO_TOKENS.map(({ token, hint }) => (
                    <button
                      key={token}
                      onClick={() => isPaid && insertToken(token)}
                      title={isPaid ? hint : "Pro feature"}
                      disabled={!isPaid}
                      className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                        isPaid
                          ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                          : "cursor-not-allowed border-border text-text-secondary opacity-40"
                      }`}>
                      {!isPaid && "🔒 "}
                      {token}
                    </button>
                  ))}
                </div>

                {renameTemplate && (
                  <div className="rounded-md bg-bg-secondary px-3 py-2 text-[11px] text-text-secondary">
                    Preview:{" "}
                    <span className="font-medium text-text-primary font-mono">
                      {previewFilename(renameTemplate)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Destination folder */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Destination folder <span className="text-red-400">*</span></label>
              <input
                value={folderTemplate}
                onChange={(e) => setRule({ ...rule, actions: { ...rule.actions!, move_to: e.target.value } })}
                placeholder="Finance/Invoices/[YYYY]/[MM]/"
                className="rounded-md border border-border bg-bg-card px-3 py-2 text-sm font-mono text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="text-[11px] text-text-secondary">Created inside your Downloads folder. Use <code className="font-mono">[YYYY]</code>, <code className="font-mono">[MM]</code>, <code className="font-mono">[domain]</code> for dynamic paths.</p>
            </div>

            {/* Pro actions */}
            {isPaid && (
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Pro actions</p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.actions?.notify ?? false}
                    onChange={(e) => setRule({ ...rule, actions: { ...rule.actions!, notify: e.target.checked } })}
                    className="accent-accent"
                  />
                  <span className="text-xs text-text-primary">Show notification when rule fires</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.actions?.open_after ?? false}
                    onChange={(e) => setRule({ ...rule, actions: { ...rule.actions!, open_after: e.target.checked } })}
                    className="accent-accent"
                  />
                  <span className="text-xs text-text-primary">Open file after download</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Preview ── */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-secondary">Here's a summary of your rule:</p>

            <div className="rounded-xl border border-border bg-bg-secondary p-4 text-sm">
              <p className="font-semibold text-text-primary mb-3">{rule.name}</p>
              {rule.description && (
                <p className="text-xs text-text-secondary mb-3 italic">{rule.description}</p>
              )}
              <div className="flex flex-col gap-3">
                {groups.map((g, gi) => (
                  <div key={g.id}>
                    {gi > 0 && <p className="text-[11px] font-bold text-accent uppercase my-1">or</p>}
                    <div className="rounded-lg border border-border bg-bg-card px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1.5">
                        {g.logic === "AND" ? "All must match" : "Any can match"}
                      </p>
                      {g.conditions.map((c) => (
                        <div key={c.id} className="text-xs text-text-secondary py-0.5">
                          <span className="font-medium text-text-primary">
                            {FIELDS[c.field]?.label ?? c.field}
                          </span>{" "}
                          {OPERATOR_LABELS[c.operator]}{" "}
                          <span className="font-mono text-accent">"{c.value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5 text-xs text-text-secondary">
                <div>
                  <span className="font-medium text-text-primary">Rename: </span>
                  {rule.actions?.skip_rename ? "Keep original filename" : renameTemplate}
                </div>
                <div>
                  <span className="font-medium text-text-primary">Move to: </span>
                  {folderTemplate || "—"}
                </div>
                {rule.actions?.notify && <div>• Notify on match</div>}
                {rule.actions?.open_after && <div>• Open file after download</div>}
              </div>
            </div>

            {/* Example outputs */}
            {!rule.actions?.skip_rename && renameTemplate && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-text-secondary">Example outputs</p>
                {[".pdf", ".xlsx", ".csv"].map((ext) => (
                  <div key={ext} className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-3 py-2">
                    <span className="font-mono text-xs text-text-secondary">document{ext}</span>
                    <span className="text-text-secondary text-xs px-2">→</span>
                    <span className="font-mono text-xs text-text-primary truncate">
                      {folderTemplate}{renameTemplate.replace(/\[ext\]/g, ext.slice(1))
                        .replaceAll("[page_title]", "Q2_Revenue_Report")
                        .replaceAll("[domain]", "Stripe")
                        .replaceAll("[date]", new Date().toISOString().split("T")[0])
                        .replaceAll("[YYYY]", String(new Date().getFullYear()))
                        .replaceAll("[MM]", String(new Date().getMonth() + 1).padStart(2, "0"))
                        .replaceAll("[DD]", String(new Date().getDate()).padStart(2, "0"))
                        .replaceAll("[YYYY-MM-DD]", new Date().toISOString().split("T")[0])
                        .replaceAll("[original]", "document")}{ext}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button variant="ghost" size="sm" onClick={() => step === 1 ? onClose() : setStep(step - 1)}>
          {step === 1 ? "Cancel" : "← Back"}
        </Button>
        {step < 4 ? (
          <Button size="sm" disabled={!canAdvance()} onClick={() => setStep(step + 1)}>
            Continue →
          </Button>
        ) : (
          <Button size="sm" onClick={handleSave}>
            Save Rule
          </Button>
        )}
      </div>
    </Modal>
  )
}

// ── Condition Row ─────────────────────────────────────────────────────────────

function ConditionRow({
  condition,
  isPaid,
  showConnector,
  connectorLabel,
  onChange,
  onRemove,
}: {
  condition: RuleCondition
  isPaid: boolean
  showConnector: boolean
  connectorLabel: "AND" | "OR"
  onChange: (patch: Partial<RuleCondition>) => void
  onRemove: () => void
}) {
  const fieldDef = FIELDS[condition.field]
  const availableOps = fieldDef?.operators ?? ["contains"]

  function handleFieldChange(field: ConditionField) {
    const def = FIELDS[field]
    const defaultOp = def?.operators[0] ?? "contains"
    onChange({ field, operator: defaultOp, value: "" })
  }

  function handleOperatorChange(op: ConditionOperator) {
    onChange({ operator: op })
  }

  // Group fields by category
  const fieldGroups = Object.entries(FIELDS).reduce<Record<string, [ConditionField, FieldDef][]>>(
    (acc, [f, def]) => {
      if (!acc[def.group]) acc[def.group] = []
      acc[def.group].push([f as ConditionField, def])
      return acc
    },
    {}
  )

  const isProField = fieldDef?.pro && !isPaid
  const isProOp = PRO_OPERATORS.includes(condition.operator) && !isPaid

  return (
    <div>
      <div className={`flex items-start gap-2 ${isProField || isProOp ? "opacity-60" : ""}`}>
        {/* Field selector */}
        <select
          value={condition.field}
          onChange={(e) => handleFieldChange(e.target.value as ConditionField)}
          className="flex-shrink-0 w-44 rounded-md border border-border bg-bg-secondary px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent">
          {Object.entries(fieldGroups).map(([group, fields]) => (
            <optgroup key={group} label={`── ${group}`}>
              {fields.map(([f, def]) => (
                <option key={f} value={f} disabled={def.pro && !isPaid}>
                  {def.label}{def.pro && !isPaid ? " 🔒" : ""}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Operator selector */}
        <select
          value={condition.operator}
          onChange={(e) => handleOperatorChange(e.target.value as ConditionOperator)}
          className="flex-shrink-0 w-40 rounded-md border border-border bg-bg-secondary px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent">
          {availableOps.map((op) => (
            <option key={op} value={op} disabled={PRO_OPERATORS.includes(op) && !isPaid}>
              {OPERATOR_LABELS[op]}{PRO_OPERATORS.includes(op) && !isPaid ? " 🔒" : ""}
            </option>
          ))}
        </select>

        {/* Value input */}
        <ValueInput
          condition={condition}
          fieldDef={fieldDef}
          onChange={(value) => onChange({ value })}
        />

        {/* Remove */}
        <button onClick={onRemove} className="mt-1.5 flex-shrink-0 text-text-secondary hover:text-red-400 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>

      {/* AND/OR connector */}
      {showConnector && (
        <div className="flex items-center gap-2 my-1.5 ml-2">
          <div className="h-3 w-px bg-border ml-2" />
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
            connectorLabel === "AND"
              ? "bg-blue-500/15 text-blue-400"
              : "bg-accent/15 text-accent"
          }`}>
            {connectorLabel}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Value input — adapts to field/operator ────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function ValueInput({
  condition,
  fieldDef,
  onChange,
}: {
  condition: RuleCondition
  fieldDef: FieldDef | undefined
  onChange: (value: string) => void
}) {
  const op = condition.operator
  const isMultiValue = ["is_any_of", "is_none_of", "contains_any_of", "contains_all_of"].includes(op)

  if (condition.field === "download_day") {
    const selected = condition.value.split(",").map((v) => v.trim()).filter(Boolean)
    return (
      <div className="flex flex-wrap gap-1 flex-1">
        {DAYS.map((day, i) => {
          const val = String(i)
          const active = selected.includes(val)
          return (
            <button
              key={day}
              onClick={() => {
                const next = active ? selected.filter((v) => v !== val) : [...selected, val]
                onChange(next.join(", "))
              }}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                active ? "bg-accent text-white" : "border border-border bg-bg-card text-text-secondary hover:border-accent/50"
              }`}>
              {day}
            </button>
          )
        })}
      </div>
    )
  }

  if (condition.field === "download_hour") {
    return (
      <input
        type="number"
        min={0} max={23}
        value={condition.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0–23"
        className="flex-1 rounded-md border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
      />
    )
  }

  if (condition.field === "file_size") {
    return (
      <div className="flex items-center gap-1 flex-1">
        <input
          type="number"
          min={0}
          value={condition.value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="size in MB"
          className="flex-1 rounded-md border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <span className="text-xs text-text-secondary flex-shrink-0">MB</span>
      </div>
    )
  }

  // Multi-value tag input
  if (isMultiValue) {
    return (
      <TagInput
        value={condition.value}
        onChange={onChange}
        placeholder={fieldDef?.placeholder(op) ?? "Type and press Enter or comma"}
      />
    )
  }

  // Default text input
  return (
    <input
      value={condition.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={fieldDef?.placeholder(op) ?? "value"}
      className="flex-1 rounded-md border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
    />
  )
}

// ── Tag input for multi-value fields ─────────────────────────────────────────

function TagInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [input, setInput] = useState("")
  const tags = value.split(",").map((v) => v.trim()).filter(Boolean)

  function commit(raw: string) {
    const newTags = raw.split(",").map((v) => v.trim()).filter(Boolean)
    const next = [...tags, ...newTags].filter((v, i, a) => a.indexOf(v) === i)
    onChange(next.join(", "))
    setInput("")
  }

  function removeTag(i: number) {
    const next = tags.filter((_, j) => j !== i)
    onChange(next.join(", "))
  }

  return (
    <div className="flex flex-wrap items-center gap-1 flex-1 min-h-[30px] rounded-md border border-border bg-bg-card px-2 py-1 focus-within:ring-1 focus-within:ring-accent">
      {tags.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 rounded bg-accent/15 px-1.5 py-0.5 text-[11px] text-accent font-mono">
          {tag}
          <button onClick={() => removeTag(i)} className="hover:text-red-400 transition-colors">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault()
            commit(input)
          } else if (e.key === "Backspace" && !input && tags.length > 0) {
            removeTag(tags.length - 1)
          }
        }}
        onBlur={() => input.trim() && commit(input)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-xs text-text-primary placeholder:text-text-secondary outline-none font-mono"
      />
    </div>
  )
}
