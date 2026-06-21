import {
  Activity,
  BookOpen,
  CheckCircle,
  CreditCard,
  Library,
  List,
  Palette
} from "lucide-react"
import { useEffect, useState } from "react"
import { I18nProvider, useT } from "../contexts/I18nContext"
import { LANGUAGES } from "../lib/i18n"

import "../style.css"

import { applyTheme } from "../assets/themes"
import { ActivityLog } from "../components/ActivityLog"
import { Onboarding } from "../components/Onboarding"
import { PackCard } from "../components/PackCard"
import { PackLibrary } from "../components/PackLibrary"
import { RuleBuilder } from "../components/RuleBuilder"
import { RuleList } from "../components/RuleList"
import { ThemeSwitcher } from "../components/ThemeSwitcher"
import { Badge, Button, Modal, Select, Toggle } from "../components/ui"
import { getRulesForPacks, isPackFree, PACKS } from "../lib/packs"
import { PRICING, type PlanType } from "../lib/pricing"
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

type Tab = "packs" | "templates" | "rules" | "activity" | "appearance" | "account"

const MAX_FREE_PACKS = PRICING.free.maxActivePacks
const MAX_FREE_CUSTOM = PRICING.free.maxCustomRules

export default function OptionsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [tab, setTab] = useState<Tab>("templates")
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
    if (!active && !settings.is_paid && !isPackFree(pack)) {
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
    <I18nProvider lang={settings.language ?? "en"}>
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
        {tab === "templates" && (
          <PackLibrary
            settings={settings}
            onSettingsChange={async (patch) => {
              await updateSettings(patch)
              if (patch.active_packs) {
                const packRules = getRulesForPacks(patch.active_packs)
                const custom = rules.filter((r) => r.is_custom)
                const newRules = [...packRules, ...custom]
                setRules(newRules)
                await saveRules(newRules)
                chrome.runtime.sendMessage({ type: "filer:install_packs", packs: patch.active_packs })
              }
            }}
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
          <ActivityTabWrapper
            activity={activity}
            settings={settings}
            onUpgrade={() => setShowUpgrade(true)}
          />
        )}
        {tab === "appearance" && (
          <AppearanceTab settings={settings} onUpdate={updateSettings} isPaid={settings.is_paid} onUpgrade={() => setShowUpgrade(true)} />
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
    </I18nProvider>
  )
}

// ──────────────────────────────────────────────
// Sidebar
// ──────────────────────────────────────────────

const NAV_KEYS: { key: Tab; tKey: string; Icon: React.ElementType }[] = [
  { key: "templates",  tKey: "nav.templates",   Icon: Library },
  { key: "packs",      tKey: "nav.my_packs",   Icon: BookOpen },
  { key: "rules",      tKey: "nav.my_rules",    Icon: List },
  { key: "activity",   tKey: "nav.activity",    Icon: Activity },
  { key: "appearance", tKey: "nav.appearance",  Icon: Palette },
  { key: "account",    tKey: "nav.account",     Icon: CreditCard }
]

function NavLabel({ tKey }: { tKey: string }) {
  const { t } = useT()
  return <>{t(tKey)}</>
}

function Sidebar({
  tab,
  onTabChange,
  settings
}: {
  tab: Tab
  onTabChange: (t: Tab) => void
  settings: UserSettings
}) {
  const { t } = useT()
  return (
    <aside className="w-52 flex-shrink-0 border-r border-border bg-bg-secondary flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1f2e] border border-border/60">
          <svg width="18" height="18" viewBox="0 0 512 512" fill="none" aria-hidden="true">
            <path d="M115 183C115 166 128 153 145 153H222L260 191H367C384 191 397 204 397 221V341C397 358 384 371 367 371H145C128 371 115 358 115 341V183Z" fill="#ffffff" fillOpacity="0.95"/>
            <rect x="158" y="239" width="196" height="19" rx="9.5" fill="#c9a961"/>
            <rect x="158" y="277" width="128" height="19" rx="9.5" fill="#c9a961" fillOpacity="0.65"/>
            <rect x="158" y="315" width="158" height="19" rx="9.5" fill="#c9a961" fillOpacity="0.35"/>
          </svg>
        </div>
        <span className="font-semibold text-base text-text-primary">Filer</span>
        {settings.is_paid && <Badge color="warning">Pro</Badge>}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_KEYS.map(({ key, tKey, Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? "bg-bg-card text-text-primary shadow-sm"
                : "text-text-secondary hover:bg-bg-card hover:text-text-primary"
            }`}>
            <Icon size={16} />
            <NavLabel tKey={tKey} />
          </button>
        ))}
      </nav>

      {/* Global toggle at bottom */}
      <div className="mt-auto border-t border-border pt-4 px-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            {settings.extension_enabled ? t("sidebar.enabled") : t("sidebar.paused")}
          </span>
          <Toggle
            checked={settings.extension_enabled}
            onChange={async (v) => {
              await saveSettings({ extension_enabled: v })
            }}
            label={t("sidebar.enabled")}
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
  const { t } = useT()
  const active = settings.active_packs

  return (
    <div>
      <SectionHeader
        title={t("packs.title")}
        subtitle={active.length === 1
          ? t("packs.installed", { n: active.length })
          : t("packs.installed_pl", { n: active.length })}
      />

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <span className="text-4xl">📦</span>
          <p className="text-sm font-medium text-text-primary">{t("packs.empty.title")}</p>
          <p className="text-xs text-text-secondary">{t("packs.empty.body")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((pack) => (
            <PackCard
              key={pack}
              pack={pack}
              active
              onToggle={onToggle}
              locked={false}
              onLockedClick={onUpgrade}
            />
          ))}
        </div>
      )}
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
  const { t } = useT()
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
        title={t("rules.title")}
        subtitle={rules.length === 1
          ? t("rules.subtitle", { n: rules.length })
          : t("rules.subtitle_pl", { n: rules.length })}
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
  onUpdate,
  isPaid,
  onUpgrade
}: {
  settings: UserSettings
  onUpdate: (patch: Partial<UserSettings>) => Promise<void>
  isPaid: boolean
  onUpgrade: () => void
}) {
  const { t } = useT()
  const [pendingLang, setPendingLang] = useState<string | null>(null)

  const currentLang = LANGUAGES.find((l) => l.code === settings.language) ?? LANGUAGES[0]
  const pendingLangMeta = LANGUAGES.find((l) => l.code === pendingLang)

  const sampleFilename = (fmt: DateFormat) => {
    const d = new Date()
    const Y = d.getFullYear()
    const M = String(d.getMonth() + 1).padStart(2, "0")
    const D = String(d.getDate()).padStart(2, "0")
    const date = fmt.replace("YYYY", String(Y)).replace("MM", M).replace("DD", D)
    return `Q2_Revenue_Report_${date}.pdf`
  }

  return (
    <div>
      <SectionHeader title={t("appear.title")} />

      <div className="flex flex-col gap-8">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">{t("appear.theme")}</h2>
          <ThemeSwitcher
            current={settings.theme}
            onChange={(th) => onUpdate({ theme: th })}
            isPaid={isPaid}
            onLockedClick={onUpgrade}
          />
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">{t("appear.date_format")}</h2>
          <div className="flex flex-col gap-2">
            {(["YYYY-MM-DD", "DD-MM-YYYY", "MM-DD-YYYY"] as DateFormat[]).map((fmt) => (
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
                <span className="font-mono text-sm text-text-primary">{fmt}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-bg-secondary px-4 py-3 text-sm">
            <span className="text-text-secondary">{t("appear.preview")}: </span>
            <span className="font-mono text-text-primary">{sampleFilename(settings.date_format)}</span>
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">{t("appear.logging")}</h2>
          <div className="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-3">
            <div>
              <p className="text-sm text-text-primary">{t("appear.logging.body")}</p>
              <p className="text-xs text-text-secondary">{t("appear.logging.subtitle")}</p>
            </div>
            <Toggle
              checked={settings.enable_log}
              onChange={(v) => onUpdate({ enable_log: v })}
              label={t("appear.logging")}
            />
          </div>
        </div>

        {/* Language — compact picklist */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-text-primary">{t("appear.language")}</h2>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-card px-4 py-3">
            <span className="text-xl">{currentLang.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{currentLang.native}</p>
              <p className="text-xs text-text-secondary">{currentLang.name}</p>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setPendingLang(e.target.value)}
              className="rounded-lg border border-border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary outline-none cursor-pointer"
              style={{ minWidth: 160 }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Language confirmation modal */}
      {pendingLang && pendingLangMeta && (
        <Modal
          title={t("appear.language")}
          onClose={() => setPendingLang(null)}
        >
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-secondary p-4">
              <span className="text-4xl">{pendingLangMeta.flag}</span>
              <div>
                <p className="text-base font-semibold text-text-primary">{pendingLangMeta.native}</p>
                <p className="text-xs text-text-secondary">{pendingLangMeta.name}</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary">
              {t("appear.lang.switch_body", { lang: pendingLangMeta.native })}
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={async () => {
                  await onUpdate({ language: pendingLang })
                  setPendingLang(null)
                }}
              >
                {t("appear.lang.apply")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setPendingLang(null)}
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// Account Tab
// ──────────────────────────────────────────────

const API_BASE = "https://filer-api.vercel.app"

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
  const { t } = useT()
  const [licenseKey, setLicenseKey] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [licenseError, setLicenseError] = useState("")

  async function handleVerify() {
    const key = licenseKey.trim().toUpperCase()
    if (!key) return
    setVerifying(true)
    setLicenseError("")
    try {
      const res = await fetch(`${API_BASE}/api/verify-license?key=${encodeURIComponent(key)}`)
      const data = await res.json()
      if (data.valid) {
        await saveSettings({ is_paid: true, license_key: key, license_email: data.email, license_plan: data.plan })
        window.location.reload()
      } else {
        setLicenseError(data.reason === "revoked" ? "This license has been revoked." : "License key not found. Check your email and try again.")
      }
    } catch {
      setLicenseError("Could not reach the license server. Check your connection.")
    } finally {
      setVerifying(false)
    }
  }

  async function handleUpgradeClick(plan: "monthly" | "lifetime") {
    try {
      const res = await fetch(`${API_BASE}/api/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      })
      const { url } = await res.json()
      if (url) chrome.tabs.create({ url })
    } catch {
      onUpgrade()
    }
  }

  if (settings.is_paid) {
    return (
      <div>
        <SectionHeader title={t("acct.title")} />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-semibold text-text-primary">Filer Pro</p>
              <p className="text-xs text-text-secondary">
                {(settings as any).license_email ?? "All features unlocked"}
              </p>
            </div>
            <Badge color="warning" className="ml-auto">Pro</Badge>
          </div>
          <div className="rounded-xl border border-border bg-bg-card p-4">
            <div className="flex flex-col gap-2 text-sm">
              <Row label="Plan" value={(settings as any).license_plan === "monthly" ? "Pro Monthly" : "Pro Lifetime"} />
              <Row label="Active rules" value={String(rulesCount)} />
              <Row label="License key" value={(settings as any).license_key ?? "—"} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader title={t("acct.title")} />
      <div className="flex flex-col gap-4">
        {/* Current limits */}
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-3">
            Free plan
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Row label={t("acct.custom_rules")}
              value={t("acct.used_of", { n: customCount, max: MAX_FREE_CUSTOM })}
              warn={customCount >= MAX_FREE_CUSTOM} />
            <Row label={t("acct.active_packs")}
              value={t("acct.used_of", { n: settings.active_packs.length, max: PRICING.free.maxActivePacks })}
              warn={false} />
            <Row label={t("acct.history")} value="30 days" />
          </div>
        </div>

        {/* Upgrade buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleUpgradeClick("lifetime")}
            className="flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:bg-bg-secondary"
            style={{ borderColor: "#d4af37", background: "#d4af3710" }}>
            <div>
              <p className="font-semibold text-text-primary">Pro Lifetime <span className="text-xs font-normal text-text-secondary ml-1">Launch pricing</span></p>
              <p className="text-xs text-text-secondary mt-0.5">All packs, unlimited rules, forever</p>
            </div>
            <span className="text-lg font-bold" style={{ color: "#d4af37" }}>$29.99</span>
          </button>
          <button
            onClick={() => handleUpgradeClick("monthly")}
            className="flex items-center justify-between rounded-xl border border-border bg-bg-card px-4 py-3 text-left transition-colors hover:bg-bg-secondary">
            <div>
              <p className="font-semibold text-text-primary">Pro Monthly</p>
              <p className="text-xs text-text-secondary mt-0.5">Cancel any time</p>
            </div>
            <span className="text-lg font-bold text-text-primary">$4.99<span className="text-xs font-normal text-text-secondary">/mo</span></span>
          </button>
        </div>

        {/* License key entry */}
        <div className="rounded-xl border border-border bg-bg-card p-4">
          <p className="text-xs font-medium text-text-secondary mb-2">Already purchased? Enter your license key</p>
          <div className="flex gap-2">
            <input
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="FILER-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="flex-1 rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent font-mono"
            />
            <Button size="sm" onClick={handleVerify} disabled={verifying}>
              {verifying ? "…" : "Activate"}
            </Button>
          </div>
          {licenseError && (
            <p className="mt-2 text-xs text-red-400">{licenseError}</p>
          )}
          <p className="mt-2 text-[11px] text-text-secondary">
            Your license key was emailed to you after purchase.
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
  const { t } = useT()
  return (
    <Modal onClose={onClose} title={t("price.choose_plan")}>
      <div className="p-6 flex flex-col gap-5">
        <div className="text-center">
          <p className="text-sm font-medium text-text-primary">{t("price.headline")}</p>
          <p className="text-xs text-text-secondary mt-1">{t("price.subheadline")}</p>
        </div>

        <PricingCards onSelect={onClose} />

        <button onClick={onClose}
          className="text-xs text-text-secondary hover:text-text-primary transition-colors text-center py-1">
          {t("common.cancel")}
        </button>
      </div>
    </Modal>
  )
}

// ──────────────────────────────────────────────
// Pricing cards — Monthly vs Lifetime
// ──────────────────────────────────────────────

function PricingCards({ onSelect }: { onSelect: (plan: PlanType) => void }) {
  const { t } = useT()
  const [selected, setSelected] = useState<PlanType>("lifetime")

  const FEATURES = [
    "acct.feat.1", "acct.feat.2", "acct.feat.3",
    "acct.feat.4", "acct.feat.5", "acct.feat.6"
  ] as const

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text-primary">{t("price.choose_plan")}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Monthly card */}
        <button
          onClick={() => setSelected("monthly")}
          className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
            selected === "monthly"
              ? "border-accent bg-accent/5 shadow-sm"
              : "border-border bg-bg-card hover:border-accent/50"
          }`}>
          <p className="text-xs font-medium text-text-secondary mb-2">{t("price.monthly")}</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-text-primary">{PRICING.monthly.display}</span>
            <span className="text-xs text-text-secondary">{t("price.per_month")}</span>
          </div>
          <p className="mt-2 text-[10px] text-text-secondary">{t("price.coming_soon")}</p>
          {selected === "monthly" && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>

        {/* Lifetime card — highlighted */}
        <button
          onClick={() => setSelected("lifetime")}
          className={`relative flex flex-col rounded-xl border-2 p-4 text-left transition-all ${
            selected === "lifetime"
              ? "border-accent bg-accent/5 shadow-sm"
              : "border-accent/40 bg-bg-card hover:border-accent"
          }`}>
          {/* Best Value badge */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
              {t("price.lifetime_badge")}
            </span>
          </div>
          <p className="text-xs font-medium text-text-secondary mb-2 mt-1">{t("price.lifetime")}</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-bold text-text-primary">{PRICING.lifetime.display}</span>
          </div>
          <p className="mt-1 text-[10px] text-text-secondary">{t("price.lifetime_note")}</p>
          <div className="mt-2">
            <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
              {t("price.launch_label")}
            </span>
          </div>
          {selected === "lifetime" && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Feature list */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-bg-card px-4 py-3">
        {FEATURES.map((key) => (
          <div key={key} className="flex items-center gap-2 text-xs text-text-secondary">
            <CheckCircle size={12} className="text-success flex-shrink-0" />
            {t(key)}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button className="w-full" onClick={() => {
        console.log("upgrade clicked", selected)
        onSelect(selected)
      }}>
        {selected === "lifetime" ? t("price.cta_lifetime") : t("price.cta_monthly")}
      </Button>

      {/* Launch pricing note */}
      <p className="text-center text-[10px] text-text-secondary leading-relaxed">
        {t("price.launch_note")}
      </p>
      <p className="text-center text-[10px] text-text-secondary">{t("price.coming_soon")}</p>
    </div>
  )
}

// ──────────────────────────────────────────────
// Activity Tab Wrapper
// ──────────────────────────────────────────────

function ActivityTabWrapper({
  activity,
  settings,
  onUpgrade
}: {
  activity: ActivityEntry[]
  settings: UserSettings
  onUpgrade: () => void
}) {
  const { t } = useT()
  const subtitle = activity.length === 1
    ? t("activity.subtitle", { n: activity.length })
    : t("activity.subtitle_pl", { n: activity.length })
  return (
    <div>
      <SectionHeader title={t("activity.title")} subtitle={subtitle} />
      <ActivityLog entries={activity} isPaid={settings.is_paid} onUpgrade={onUpgrade} />
    </div>
  )
}
