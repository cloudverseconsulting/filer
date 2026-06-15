import {
  Activity,
  BookOpen,
  CheckCircle,
  CreditCard,
  List,
  Palette
} from "lucide-react"
import { useEffect, useState } from "react"

import "../style.css"

import { applyTheme } from "../assets/themes"
import { ActivityLog } from "../components/ActivityLog"
import { Onboarding } from "../components/Onboarding"
import { PackCard } from "../components/PackCard"
import { RuleBuilder } from "../components/RuleBuilder"
import { RuleList } from "../components/RuleList"
import { ThemeSwitcher } from "../components/ThemeSwitcher"
import { Badge, Button, Modal, Select, Toggle } from "../components/ui"
import { getRulesForPacks, PACKS } from "../lib/packs"
import {
  clearActivity,
  loadActivity,
  loadRules,
  loadSettings,
  saveRules,
  saveSettings
} from "../lib/storage"
import type {
  ActivityEntry,
  DateFormat,
  PersonaPack,
  Rule,
  Theme,
  UserSettings
} from "../types"

type Tab = "packs" | "rules" | "activity" | "appearance" | "account"

const MAX_FREE_PACKS = 3
const MAX_FREE_CUSTOM = 5

export default function OptionsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [tab, setTab] = useState<Tab>("packs")
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    if (settings) applyTheme(settings.theme)
  }, [settings?.theme])

  async function refresh() {
    const [s, r, a] = await Promise.all([
      loadSettings(),
      loadRules(),
      loadActivity()
    ])
    setSettings(s)
    setRules(r)
    setActivity(a)
  }

  async function updateSettings(patch: Partial<UserSettings>) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveSettings(patch)
  }

  async function handlePackToggle(pack: PersonaPack) {
    if (!settings) return
    const active = settings.active_packs.includes(pack)
    if (!active && !settings.is_paid && settings.active_packs.length >= MAX_FREE_PACKS) {
      setShowUpgrade(true)
      return
    }
    const next = active
      ? settings.active_packs.filter((p) => p !== pack)
      : [...settings.active_packs, pack]

    await updateSettings({ active_packs: next })

    // Rebuild rule set from packs + custom rules
    const packRules = getRulesForPacks(next)
    const custom = rules.filter((r) => r.is_custom)
    const newRules = [...packRules, ...custom]
    setRules(newRules)
    await saveRules(newRules)
    chrome.runtime.sendMessage({ type: "filer:install_packs", packs: next })
  }

  async function handleRuleToggle(id: string, active: boolean) {
    const next = rules.map((r) => (r.id === id ? { ...r, active } : r))
    setRules(next)
    await saveRules(next)
  }

  async function handleRuleSave(rule: Rule) {
    const exists = rules.some((r) => r.id === rule.id)
    const next = exists
      ? rules.map((r) => (r.id === rule.id ? rule : r))
      : [...rules, rule]
    setRules(next)
    await saveRules(next)
  }

  async function handleRuleDelete(id: string) {
    const next = rules.filter((r) => r.id !== id)
    setRules(next)
    await saveRules(next)
  }

  if (!settings) {
    return (
      <div className="bg-bg-primary min-h-screen flex items-center justify-center text-text-secondary text-sm">
        Loading…
      </div>
    )
  }

  if (!settings.onboarding_complete) {
    return (
      <Onboarding
        onComplete={async () => {
          await refresh()
        }}
      />
    )
  }

  const customRules = rules.filter((r) => r.is_custom)

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen flex">
      <Sidebar tab={tab} onTabChange={setTab} settings={settings} />

      <main className="flex-1 px-10 py-10 overflow-y-auto">
        {tab === "packs" && (
          <PacksTab
            settings={settings}
            onToggle={handlePackToggle}
            onUpgrade={() => setShowUpgrade(true)}
          />
        )}
        {tab === "rules" && (
          <RulesTab
            rules={rules}
            settings={settings}
            customCount={customRules.length}
            onToggle={handleRuleToggle}
            onSave={handleRuleSave}
            onDelete={handleRuleDelete}
            onUpgrade={() => setShowUpgrade(true)}
          />
        )}
        {tab === "activity" && (
          <div>
            <SectionHeader
              title="Activity Log"
              subtitle={`${activity.length} download${activity.length !== 1 ? "s" : ""} processed`}
            />
            <ActivityLog
              entries={activity}
              isPaid={settings.is_paid}
              onUpgrade={() => setShowUpgrade(true)}
            />
          </div>
        )}
        {tab === "appearance" && (
          <AppearanceTab settings={settings} onUpdate={updateSettings} />
        )}
        {tab === "account" && (
          <AccountTab
            settings={settings}
            rulesCount={rules.length}
            customCount={customRules.length}
            onUpgrade={() => setShowUpgrade(true)}
          />
        )}
      </main>

      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────

const NAV: { key: Tab; label: string; Icon: React.ElementType }[] = [
  { key: "packs", label: "My Packs", Icon: BookOpen },
  { key: "rules", label: "My Rules", Icon: List },
  { key: "activity", label: "Activity Log", Icon: Activity },
  { key: "appearance", label: "Appearance", Icon: Palette },
  { key: "account", label: "Account", Icon: CreditCard }
]

function Sidebar({
  tab,
  onTabChange,
  settings
}: {
  tab: Tab
  onTabChange: (t: Tab) => void
  settings: UserSettings
}) {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-border bg-bg-secondary flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">
          F
        </div>
        <span className="font-semibold text-base text-text-primary">Filer</span>
        {settings.is_paid && <Badge color="warning">Pro</Badge>}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
            }`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Global toggle at bottom */}
      <div className="mt-auto border-t border-border pt-4 px-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            {settings.extension_enabled ? "Enabled" : "Paused"}
          </span>
          <Toggle
            checked={settings.extension_enabled}
            onChange={async (v) => {
              await saveSettings({ extension_enabled: v })
            }}
            label="Toggle Filer"
          />
        </div>
      </div>
    </aside>
  )
}

// ──────────────────────────────────────────────
// Section header
// ──────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Packs Tab
// ──────────────────────────────────────────────

function PacksTab({
  settings,
  onToggle,
  onUpgrade
}: {
  settings: UserSettings
  onToggle: (p: PersonaPack) => void
  onUpgrade: () => void
}) {
  const all = Object.keys(PACKS) as PersonaPack[]

  return (
    <div>
      <SectionHeader
        title="My Packs"
        subtitle="Pre-built rule collections for common download patterns."
      />
      {!settings.is_paid && (
        <div className="mb-5 flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-4 py-3">
          <p className="text-xs text-warning">
            Free plan: up to {MAX_FREE_PACKS} active packs.{" "}
            {settings.active_packs.length}/{MAX_FREE_PACKS} used.
          </p>
          <button
            onClick={onUpgrade}
            className="text-xs font-medium text-accent hover:underline">
            Upgrade →
          </button>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {all.map((pack) => (
          <PackCard
            key={pack}
            pack={pack}
            active={settings.active_packs.includes(pack)}
            onToggle={onToggle}
            locked={
              !settings.is_paid &&
              !settings.active_packs.includes(pack) &&
              settings.active_packs.length >= MAX_FREE_PACKS
            }
            onLockedClick={onUpgrade}
          />
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Rules Tab
// ──────────────────────────────────────────────

function RulesTab({
  rules,
  settings,
  customCount,
  onToggle,
  onSave,
  onDelete,
  onUpgrade
}: {
  rules: Rule[]
  settings: UserSettings
  customCount: number
  onToggle: (id: string, active: boolean) => void
  onSave: (rule: Rule) => void
  onDelete: (id: string) => void
  onUpgrade: () => void
}) {
  const [editing, setEditing] = useState<Rule | null | "new">(null)

  function handleAdd() {
    if (!settings.is_paid && customCount >= MAX_FREE_CUSTOM) {
      onUpgrade()
      return
    }
    setEditing("new")
  }

  return (
    <div>
      <SectionHeader
        title="My Rules"
        subtitle={`${rules.length} rule${rules.length !== 1 ? "s" : ""} — sorted by priority`}
      />
      <RuleList
        rules={rules}
        isPaid={settings.is_paid}
        customCount={customCount}
        onToggle={onToggle}
        onEdit={(r) => setEditing(r)}
        onDelete={onDelete}
        onAdd={handleAdd}
        onUpgrade={onUpgrade}
      />

      {editing !== null && (
        <RuleBuilder
          existingRule={editing === "new" ? undefined : editing}
          isPaid={settings.is_paid}
          onSave={(rule) => {
            onSave(rule)
            setEditing(null)
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Appearance Tab
// ──────────────────────────────────────────────

function AppearanceTab({
  settings,
  onUpdate
}: {
  settings: UserSettings
  onUpdate: (patch: Partial<UserSettings>) => Promise<void>
}) {
  const sampleFilename = (fmt: DateFormat) => {
    const d = new Date()
    const Y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, "0")
    const D = String(d.getDate()).padStart(2, "0")
    const date = fmt
      .replace("YYYY", String(Y))
      .replace("MM", M)
      .replace("DD", D)
    return `Q2_Revenue_Report_${date}.pdf`
  }

  return (
    <div>
      <SectionHeader title="Appearance" />

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            Theme
          </h2>
          <ThemeSwitcher
            current={settings.theme}
            onChange={(t) => onUpdate({ theme: t })}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            Date format
          </h2>
          <div className="flex flex-col gap-2">
            {(["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"] as DateFormat[]).map(
              (fmt) => (
                <label
                  key={fmt}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    settings.date_format === fmt
                      ? "border-accent bg-accent/10"
                      : "border-border bg-bg-card hover:bg-bg-secondary"
                  }`}>
                  <input
                    type="radio"
                    name="date_format"
                    value={fmt}
                    checked={settings.date_format === fmt}
                    onChange={() => onUpdate({ date_format: fmt })}
                    className="accent-accent"
                  />
                  <span className="font-mono text-sm text-text-primary">
                    {fmt}
                  </span>
                </label>
              )
            )}
          </div>

          <div className="mt-3 rounded-lg bg-bg-secondary px-4 py-3 text-sm">
            <span className="text-text-secondary">Preview: </span>
            <span className="font-mono text-text-primary">
              {sampleFilename(settings.date_format)}
            </span>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">
            Activity logging
          </h2>
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3">
            <div>
              <p className="text-sm text-text-primary">Log all downloads</p>
              <p className="text-xs text-text-secondary">
                Stored locally on your device
              </p>
            </div>
            <Toggle
              checked={settings.enable_log}
              onChange={(v) => onUpdate({ enable_log: v })}
              label="Toggle activity log"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// Account Tab
// ──────────────────────────────────────────────

function AccountTab({
  settings,
  rulesCount,
  customCount,
  onUpgrade
}: {
  settings: UserSettings
  rulesCount: number
  customCount: number
  onUpgrade: () => void
}) {
  if (settings.is_paid) {
    return (
      <div>
        <SectionHeader title="Account" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-text-primary">Filer Pro</p>
              <p className="text-xs text-text-secondary">
                Unlimited packs, rules, and history.
              </p>
            </div>
            <Badge color="warning" className="ml-auto">
              Pro
            </Badge>
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-4">
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Plan" value="Pro" />
              <Row label="Active rules" value={String(rulesCount)} />
              <Row label="Sync" value="Enabled across devices" />
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.open("https://filer.app/billing", "_blank")}>
            Manage subscription →
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader title="Account" />
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-3">
            Current plan: Free
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Row
              label="Custom rules"
              value={`${customCount}/${MAX_FREE_CUSTOM} used`}
              warn={customCount >= MAX_FREE_CUSTOM}
            />
            <Row
              label="Active packs"
              value={`${settings.active_packs.length}/${MAX_FREE_PACKS} used`}
              warn={settings.active_packs.length >= MAX_FREE_PACKS}
            />
            <Row label="History" value="30 days" />
            <Row label="Sync" value="Local only" />
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <p className="text-base font-semibold text-text-primary mb-3">
            Upgrade to Pro
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              "Unlimited packs & custom rules",
              "Drag-and-drop rule priority",
              "Unlimited activity history",
              "Export log to CSV",
              "Sync rules across devices"
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle size={14} className="text-success flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-text-primary">$5</span>
            <span className="text-text-secondary text-sm">/month</span>
            <span className="text-text-secondary text-xs ml-2">
              or $39/year
            </span>
          </div>
          <Button onClick={onUpgrade} className="w-full">
            Start 7-day free trial
          </Button>
          <p className="mt-2 text-center text-xs text-text-secondary">
            No card required during trial.
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  warn
}: {
  label: string
  value: string
  warn?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-border last:border-0">
      <span className="text-text-secondary text-xs">{label}</span>
      <span
        className={`text-xs font-medium ${
          warn ? "text-warning" : "text-text-primary"
        }`}>
        {value}
      </span>
    </div>
  )
}

// ──────────────────────────────────────────────
// Upgrade Modal
// ──────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} title="Upgrade to Pro">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {[
            "Unlimited packs & custom rules",
            "Drag-and-drop rule priority reordering",
            "Unlimited activity history (never expires)",
            "Export activity log to CSV",
            "Sync rules across all your devices"
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-2.5 text-sm text-text-secondary">
              <CheckCircle size={15} className="text-success flex-shrink-0" />
              {feat}
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-bg-secondary px-4 py-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary">$5</span>
            <span className="text-text-secondary text-sm">/month</span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">or $39/year — save 35%</p>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => window.open("https://filer.app/upgrade", "_blank")}>
            Start 7-day free trial
          </Button>
          <button
            onClick={onClose}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors text-center py-1">
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  )
}
