import { Plus, X } from "lucide-react"
import { useRef, useState } from "react"
import type { ConditionLogic, ConditionType, Rule, RuleCondition } from "../types"
import { Badge, Button, Input, Modal, Select } from "./ui"

interface Props {
  existingRule?: Rule
  isPaid: boolean
  onSave: (rule: Rule) => void
  onClose: () => void
}

const CONDITION_TYPES: { value: ConditionType; label: string }[] = [
  { value: "source_domain", label: "Source domain" },
  { value: "filename_contains", label: "Filename contains" },
  { value: "file_extension", label: "File extension" },
  { value: "url_contains", label: "URL contains" },
  { value: "page_title_contains", label: "Page title contains" }
]

const FREE_TOKENS = ["[page_title]", "[domain]", "[YYYY-MM-DD]"]
const PAID_TOKENS = ["[YYYY-MM]", "[YYYY]", "[original]"]
const ALL_TOKENS = [...FREE_TOKENS, ...PAID_TOKENS]

const SAMPLE: Record<string, string> = {
  "[page_title]": "Q2_Revenue_Report",
  "[domain]": "Stripe",
  "[YYYY-MM-DD]": new Date().toISOString().split("T")[0],
  "[YYYY-MM]": new Date().toISOString().slice(0, 7),
  "[YYYY]": String(new Date().getFullYear()),
  "[original]": "original_filename"
}

function previewFilename(template: string, ext: string): string {
  let out = template
  for (const [token, val] of Object.entries(SAMPLE)) {
    out = out.replace(token, val)
  }
  return out + (ext || ".pdf")
}

function blankRule(): Partial<Rule> {
  return {
    name: "",
    active: true,
    priority: 99,
    conditions: [{ type: "filename_contains", values: [] }],
    condition_logic: "ANY",
    actions: { rename_to: "[page_title]_[YYYY-MM-DD]", move_to: "" },
    is_custom: true,
    created_at: new Date().toISOString()
  }
}

export function RuleBuilder({ existingRule, isPaid, onSave, onClose }: Props) {
  const [step, setStep] = useState(1)
  const [rule, setRule] = useState<Partial<Rule>>(existingRule ?? blankRule())
  const [conditionValues, setConditionValues] = useState<string[]>(
    (existingRule?.conditions ?? [{ type: "filename_contains", values: [] }]).map(
      (c) => c.values.join(", ")
    )
  )
  const [error, setError] = useState("")
  const renameRef = useRef<HTMLInputElement>(null)

  const conditions: RuleCondition[] = (
    rule.conditions ?? [{ type: "filename_contains", values: [] }]
  )

  function updateConditionType(i: number, type: ConditionType) {
    const next = conditions.map((c, idx) => (idx === i ? { ...c, type } : c))
    setRule({ ...rule, conditions: next })
  }

  function updateConditionValues(i: number, raw: string) {
    const vals = raw
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
    const nextConds = conditions.map((c, idx) =>
      idx === i ? { ...c, values: vals } : c
    )
    setRule({ ...rule, conditions: nextConds })
    const nextRaw = conditionValues.map((v, idx) => (idx === i ? raw : v))
    setConditionValues(nextRaw)
  }

  function addCondition() {
    setRule({
      ...rule,
      conditions: [...conditions, { type: "filename_contains", values: [] }]
    })
    setConditionValues([...conditionValues, ""])
  }

  function removeCondition(i: number) {
    if (conditions.length <= 1) return
    setRule({ ...rule, conditions: conditions.filter((_, idx) => idx !== i) })
    setConditionValues(conditionValues.filter((_, idx) => idx !== i))
  }

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

  function canAdvance(): boolean {
    if (step === 1) return (rule.name?.trim().length ?? 0) > 0
    if (step === 2)
      return conditions.some((c) => c.values.length > 0)
    if (step === 3)
      return (
        (rule.actions?.rename_to?.trim().length ?? 0) > 0 &&
        (rule.actions?.move_to?.trim().length ?? 0) > 0
      )
    return true
  }

  function handleSave() {
    const final: Rule = {
      id: existingRule?.id ?? crypto.randomUUID(),
      name: rule.name!.trim(),
      pack: rule.pack,
      active: rule.active ?? true,
      priority: rule.priority ?? 99,
      conditions,
      condition_logic: rule.condition_logic ?? "ANY",
      actions: rule.actions!,
      is_custom: true,
      created_at: rule.created_at ?? new Date().toISOString()
    }
    onSave(final)
  }

  const stepTitles = ["Name", "Conditions", "Actions", "Preview"]
  const renameTemplate = rule.actions?.rename_to ?? ""
  const folderTemplate = rule.actions?.move_to ?? ""

  return (
    <Modal
      onClose={onClose}
      title={existingRule ? "Edit Rule" : "New Custom Rule"}
      wide>
      {/* Step indicator */}
      <div className="flex items-center gap-0 border-b border-border px-6 py-3">
        {stepTitles.map((title, i) => {
          const num = i + 1
          const done = num < step
          const current = num === step
          return (
            <div key={title} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  current
                    ? "text-accent"
                    : done
                      ? "text-success"
                      : "text-text-secondary"
                }`}>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    current
                      ? "bg-accent text-white"
                      : done
                        ? "bg-success text-white"
                        : "bg-border text-text-secondary"
                  }`}>
                  {done ? "✓" : num}
                </span>
                {title}
              </div>
              {i < stepTitles.length - 1 && (
                <div className="mx-3 h-px w-8 bg-border" />
              )}
            </div>
          )
        })}
      </div>

      <div className="p-6">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              Give it a name you'll recognize.
            </p>
            <Input
              label="Rule name"
              value={rule.name ?? ""}
              onChange={(e) => setRule({ ...rule, name: e.target.value })}
              placeholder="e.g. Stripe Receipts"
              autoFocus
            />
          </div>
        )}

        {/* Step 2: Conditions */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              When should this rule fire?
            </p>

            <div className="flex flex-col gap-3">
              {conditions.map((cond, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                    <Select
                      options={CONDITION_TYPES}
                      value={cond.type}
                      onChange={(e) =>
                        updateConditionType(i, e.target.value as ConditionType)
                      }
                      className="flex-shrink-0 sm:w-52"
                    />
                    <Input
                      value={conditionValues[i] ?? ""}
                      onChange={(e) => updateConditionValues(i, e.target.value)}
                      placeholder="Comma-separated values"
                      hint={
                        cond.type === "file_extension"
                          ? "e.g. .pdf, .xlsx"
                          : cond.type === "source_domain"
                            ? "e.g. stripe.com, paypal.com"
                            : "e.g. invoice, receipt"
                      }
                      className="flex-1"
                    />
                  </div>
                  {conditions.length > 1 && (
                    <button
                      onClick={() => removeCondition(i)}
                      className="mt-2 text-text-secondary hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addCondition}
              className="flex items-center gap-1 text-xs text-accent hover:underline w-fit">
              <Plus size={13} /> Add condition
            </button>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-text-secondary">Match</span>
              {(["ANY", "ALL"] as ConditionLogic[]).map((logic) => (
                <button
                  key={logic}
                  onClick={() => setRule({ ...rule, condition_logic: logic })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    rule.condition_logic === logic
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-text-secondary hover:border-text-secondary"
                  }`}>
                  {logic} conditions
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Actions */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-secondary">
              What should happen when this rule fires?
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-text-secondary">
                Rename template
              </label>
              <input
                ref={renameRef}
                value={renameTemplate}
                onChange={(e) =>
                  setRule({
                    ...rule,
                    actions: { ...rule.actions!, rename_to: e.target.value }
                  })
                }
                placeholder="e.g. [page_title]_[YYYY-MM-DD]"
                className="rounded-md border border-border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
              />
              {/* Token chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_TOKENS.map((token) => {
                  const locked = !isPaid && PAID_TOKENS.includes(token)
                  return (
                    <button
                      key={token}
                      disabled={locked}
                      onClick={() => insertToken(token)}
                      title={locked ? "Pro feature" : `Insert ${token}`}
                      className={`rounded border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                        locked
                          ? "cursor-not-allowed border-border text-text-secondary opacity-40"
                          : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
                      }`}>
                      {locked ? "🔒 " : ""}
                      {token}
                    </button>
                  )
                })}
              </div>

              {/* Live preview */}
              {renameTemplate && (
                <div className="mt-1 rounded-md bg-bg-secondary px-3 py-2 text-[11px] text-text-secondary">
                  Preview:{" "}
                  <span className="font-medium text-text-primary">
                    {previewFilename(renameTemplate, ".pdf")}
                  </span>
                </div>
              )}
            </div>

            <Input
              label="Destination folder"
              value={folderTemplate}
              onChange={(e) =>
                setRule({
                  ...rule,
                  actions: { ...rule.actions!, move_to: e.target.value }
                })
              }
              placeholder="e.g. Finance/Invoices/"
              hint="Created inside your Downloads directory. Use [YYYY-MM] or [YYYY] for date-based folders."
            />
          </div>
        )}

        {/* Step 4: Preview */}
        {step === 4 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary">
              Here's how this rule will work:
            </p>

            <div className="rounded-xl border border-border bg-bg-secondary p-4 text-sm">
              <div className="mb-3 font-semibold text-text-primary">
                {rule.name}
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                <div>
                  <span className="font-medium text-text-primary">
                    Conditions:
                  </span>{" "}
                  {conditions
                    .map(
                      (c) =>
                        `${c.type.replace(/_/g, " ")} "${c.values.join(", ")}"`
                    )
                    .join(
                      ` ${rule.condition_logic === "ANY" ? "OR" : "AND"} `
                    )}
                </div>
                <div>
                  <span className="font-medium text-text-primary">
                    Rename to:
                  </span>{" "}
                  {renameTemplate}
                </div>
                <div>
                  <span className="font-medium text-text-primary">
                    Move to:
                  </span>{" "}
                  {folderTemplate}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-text-secondary">
                Example outputs
              </p>
              {[".pdf", ".xlsx", ".csv"].map((ext) => (
                <div
                  key={ext}
                  className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-3 py-2">
                  <span className="font-mono text-xs text-text-secondary">
                    document{ext}
                  </span>
                  <span className="text-text-secondary text-xs">→</span>
                  <span className="font-mono text-xs text-text-primary">
                    {folderTemplate}
                    {previewFilename(renameTemplate, ext)}
                  </span>
                </div>
              ))}
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step === 1 ? onClose() : setStep(step - 1))}>
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
