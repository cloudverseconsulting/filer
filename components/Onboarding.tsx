import { ArrowRight, CheckCircle, Folder, Shield, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { applyTheme, THEMES } from "../assets/themes"
import { I18nProvider, useT } from "../contexts/I18nContext"
import { LANGUAGES, t as rawT } from "../lib/i18n"
import { PACK_CATEGORIES, PACKS } from "../lib/packs"
import { saveSettings } from "../lib/storage"
import type { PackCategory, PersonaPack, Theme } from "../types"
import { ThemeSwitcher } from "./ThemeSwitcher"
import { Button } from "./ui"

interface Props {
  onComplete: () => void
}

const FEATURED_PACKS: PersonaPack[] = [
  "consultant", "developer", "student", "finance", "researcher"
]

const CATEGORY_ORDER: PackCategory[] = [
  "professional", "personal", "industry", "hobby", "meta"
]

export function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState(0)
  const [lang, setLang] = useState("en")
  const [selectedPacks, setSelectedPacks] = useState<PersonaPack[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme>("dark")

  useEffect(() => {
    applyTheme(selectedTheme)
  }, [selectedTheme])

  function togglePack(pack: PersonaPack) {
    setSelectedPacks((prev) =>
      prev.includes(pack) ? prev.filter((p) => p !== pack) : [...prev, pack]
    )
  }

  async function handleEnable() {
    await saveSettings({
      active_packs: selectedPacks,
      theme: selectedTheme,
      language: lang,
      extension_enabled: true,
      onboarding_complete: false
    })
    chrome.runtime.sendMessage(
      { type: "filer:install_packs", packs: selectedPacks },
      () => setScreen(4)
    )
  }

  async function finish() {
    await saveSettings({ onboarding_complete: true })
    onComplete()
  }

  // Screens: 0=Language, 1=Hero, 2=Persona, 3=Theme, 4=Permission, 5=Ready
  const TOTAL_STEPS = 3 // persona, theme, permission shown as progress

  return (
    <I18nProvider lang={lang}>
      <div className="bg-bg-primary text-text-primary min-h-screen flex flex-col">
        {/* Progress dots (screens 2–4) */}
        {screen >= 2 && screen <= 4 && (
          <div className="flex justify-center gap-2 pt-6">
            {[2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i <= screen ? "bg-accent" : "bg-border"
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          {screen === 0 && (
            <LanguageScreen
              selected={lang}
              onSelect={(code) => { setLang(code); setScreen(1) }}
            />
          )}
          {screen === 1 && (
            <HeroScreen onNext={() => setScreen(2)} />
          )}
          {screen === 2 && (
            <PersonaScreen
              selected={selectedPacks}
              onToggle={togglePack}
              onNext={() => setScreen(3)}
            />
          )}
          {screen === 3 && (
            <ThemeScreen
              theme={selectedTheme}
              onChange={setSelectedTheme}
              onNext={() => setScreen(4)}
            />
          )}
          {screen === 4 && (
            <PermissionScreen onEnable={handleEnable} />
          )}
          {screen === 5 && (
            <ReadyScreen packs={selectedPacks} onFinish={finish} />
          )}
        </div>
      </div>
    </I18nProvider>
  )
}

// ── Language Screen ───────────────────────────────────────────────────────────

function LanguageScreen({
  selected,
  onSelect
}: {
  selected: string
  onSelect: (code: string) => void
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-6 w-full">
      <div className="text-center">
        <div className="text-5xl mb-4">🌍</div>
        <h2 className="text-3xl font-bold text-text-primary">
          Choose your language
        </h2>
        <p className="mt-2 text-text-secondary text-sm">
          Choisissez votre langue · Wählen Sie Ihre Sprache · 选择您的语言
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 max-h-[60vh] overflow-y-auto pr-1">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
              selected === lang.code
                ? "border-accent bg-accent/10"
                : "border-border bg-bg-card hover:bg-bg-secondary"
            }`}
          >
            <span className="text-2xl flex-shrink-0">{lang.flag}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-text-primary truncate">
                {lang.native}
              </span>
              <span className="text-[11px] text-text-secondary truncate">
                {lang.name}
              </span>
            </div>
            {selected === lang.code && (
              <CheckCircle size={14} className="text-accent ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Hero Screen ───────────────────────────────────────────────────────────────

function HeroScreen({ onNext }: { onNext: () => void }) {
  const { t } = useT()
  return (
    <div className="flex max-w-lg flex-col items-center text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/20 text-accent">
        <Folder size={40} />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-text-primary leading-tight">
          Your downloads,<br />finally organized.
        </h1>
        <p className="text-lg text-text-secondary">
          Filer renames and sorts every file you download — automatically.
        </p>
      </div>

      <div className="w-full rounded-xl border border-border bg-bg-secondary p-4 text-left">
        <div className="flex flex-col gap-2">
          {[
            { before: "document(3).pdf", after: "Q2_Revenue_Report_2026-06-15.pdf", folder: "Finance/Invoices/" },
            { before: "export_1234567890.csv", after: "Salesforce_Report_2026-06-15.csv", folder: "Salesforce/" },
            { before: "untitled.pptx", after: "Product_Roadmap_2026-06-15.pptx", folder: "Presentations/" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary line-through opacity-60">{item.before}</span>
              <span className="text-text-secondary">→</span>
              <div className="flex flex-col">
                <span className="text-success font-medium">{item.after}</span>
                <span className="text-text-secondary text-[10px]">{item.folder}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onNext} size="md" className="px-8">
        {t("common.continue")} <ArrowRight size={16} />
      </Button>
    </div>
  )
}

// ── Persona Screen ────────────────────────────────────────────────────────────

function PersonaScreen({
  selected,
  onToggle,
  onNext
}: {
  selected: PersonaPack[]
  onToggle: (p: PersonaPack) => void
  onNext: () => void
}) {
  const { t } = useT()

  return (
    <div className="flex max-w-2xl flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          {t("ob.persona.title")}
        </h2>
        <p className="mt-2 text-text-secondary">
          {t("ob.persona.subtitle")}
        </p>
      </div>

      {/* Featured */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
          {t("ob.persona.popular")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {FEATURED_PACKS.map((pack) => (
            <PackButton key={pack} pack={pack} active={selected.includes(pack)} onToggle={onToggle} />
          ))}
        </div>
      </div>

      {/* By category */}
      {CATEGORY_ORDER.map((cat) => {
        const catMeta = PACK_CATEGORIES[cat]
        const catPacks = catMeta.packs.filter((p) => !FEATURED_PACKS.includes(p))
        return (
          <div key={cat}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              {catMeta.emoji} {catMeta.label}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {catPacks.map((pack) => (
                <PackButton key={pack} pack={pack} active={selected.includes(pack)} onToggle={onToggle} />
              ))}
            </div>
          </div>
        )
      })}

      <div className="flex justify-center pt-2">
        <Button onClick={onNext} disabled={selected.length === 0} className="px-8">
          {t("common.continue")} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function PackButton({
  pack,
  active,
  onToggle
}: {
  pack: PersonaPack
  active: boolean
  onToggle: (p: PersonaPack) => void
}) {
  const def = PACKS[pack]
  return (
    <button
      onClick={() => onToggle(pack)}
      className={`relative flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-all ${
        active
          ? "border-accent bg-accent/10 shadow-lg"
          : "border-border bg-bg-card hover:bg-bg-secondary"
      }`}
    >
      {active && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] text-white">
          ✓
        </span>
      )}
      <span className="text-xl">{def.emoji}</span>
      <span className="text-xs font-semibold text-text-primary leading-tight">{def.label}</span>
      <span className="text-[10px] text-text-secondary leading-snug line-clamp-2">{def.description}</span>
    </button>
  )
}

// ── Theme Screen ──────────────────────────────────────────────────────────────

function ThemeScreen({
  theme,
  onChange,
  onNext
}: {
  theme: Theme
  onChange: (t: Theme) => void
  onNext: () => void
}) {
  const { t } = useT()
  return (
    <div className="flex max-w-xl flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">{t("ob.theme.title")}</h2>
        <p className="mt-2 text-text-secondary">{t("ob.theme.subtitle")}</p>
      </div>
      <ThemeSwitcher current={theme} onChange={onChange} />
      <div className="flex justify-center">
        <Button onClick={onNext} className="px-8">
          {t("common.continue")} <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

// ── Permission Screen ─────────────────────────────────────────────────────────

function PermissionScreen({ onEnable }: { onEnable: () => void }) {
  const { t } = useT()
  const [granted, setGranted] = useState(false)

  async function requestPermission() {
    const ok = await chrome.permissions.request({
      permissions: ["downloads", "tabs"],
      origins: ["<all_urls>"]
    })
    if (ok) {
      setGranted(true)
      setTimeout(onEnable, 600)
    }
  }

  return (
    <div className="flex max-w-md flex-col items-center text-center gap-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/20 text-success">
        <Shield size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{t("ob.perm.title")}</h2>
        <p className="mt-2 text-text-secondary text-sm">{t("ob.perm.subtitle")}</p>
      </div>

      <div className="w-full flex flex-col gap-3 rounded-xl border border-border bg-bg-secondary p-4 text-left">
        {[
          { Icon: Folder,   label: t("ob.perm.downloads") },
          { Icon: Sparkles, label: t("ob.perm.tabs") },
          { Icon: Zap,      label: t("ob.perm.storage") },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent flex-shrink-0">
              <Icon size={16} />
            </div>
            <span className="text-sm text-text-secondary">{label}</span>
          </div>
        ))}
      </div>

      {granted ? (
        <Button className="px-8" onClick={onEnable}>
          {t("ob.perm.granted")} <ArrowRight size={16} />
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full">
          <Button className="px-8 w-full" onClick={requestPermission}>
            {t("ob.perm.grant")}
          </Button>
          <button
            onClick={onEnable}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {t("ob.perm.skip")}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Ready Screen ──────────────────────────────────────────────────────────────

function ReadyScreen({
  packs,
  onFinish
}: {
  packs: PersonaPack[]
  onFinish: () => void
}) {
  const { t } = useT()
  return (
    <div className="flex max-w-md flex-col items-center text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success/20 text-success">
        <CheckCircle size={40} />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-text-primary">{t("ob.ready.title")}</h2>
        <p className="mt-2 text-text-secondary">{t("ob.ready.subtitle")}</p>
      </div>

      {packs.length > 0 && (
        <div className="w-full flex flex-wrap gap-2 justify-center">
          {packs.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs text-text-secondary"
            >
              <span>{PACKS[p]?.emoji}</span>
              <span>{PACKS[p]?.label}</span>
            </span>
          ))}
        </div>
      )}

      <Button onClick={onFinish} className="px-8">
        {t("ob.ready.cta")} <ArrowRight size={16} />
      </Button>
    </div>
  )
}
