import { ArrowRight, CheckCircle, Folder, Shield, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { applyTheme, THEMES } from "../assets/themes"
import { I18nProvider, useT } from "../contexts/I18nContext"
import { LANGUAGES, t as rawT } from "../lib/i18n"
import { FREE_PACKS, PACKS } from "../lib/packs"
import { saveSettings } from "../lib/storage"
import type { PersonaPack, Theme } from "../types"
import { Button } from "./ui"

interface Props {
  onComplete: () => void
}

// Only free themes shown during onboarding — no Pro upsell
const FREE_THEME_KEYS: Theme[] = ["dark", "light", "midnight", "forest", "warm"]

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
      () => { if (!chrome.runtime.lastError) setScreen(4) }
    )
    setTimeout(() => setScreen(4), 800)
  }

  async function finish() {
    await saveSettings({ onboarding_complete: true })
    onComplete()
  }

  // Screens: 0=Language, 1=Persona, 2=Theme, 3=Permission, 4=Ready
  return (
    <I18nProvider lang={lang}>
      <div className="bg-bg-primary text-text-primary min-h-screen flex flex-col">
        {/* Progress bar (screens 1–3) */}
        {screen >= 1 && screen <= 3 && (
          <div className="flex justify-center gap-2 pt-6">
            {[1, 2, 3].map((i) => (
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
            <PersonaScreen
              selected={selectedPacks}
              onToggle={togglePack}
              onNext={() => setScreen(2)}
            />
          )}
          {screen === 2 && (
            <ThemeScreen
              theme={selectedTheme}
              onChange={setSelectedTheme}
              onNext={() => setScreen(3)}
            />
          )}
          {screen === 3 && (
            <PermissionScreen onEnable={handleEnable} />
          )}
          {screen === 4 && (
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
  const hasSelection = selected.length > 0

  return (
    <div className="flex max-w-xl flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          {t("ob.persona.title")}
        </h2>
        <p className="mt-2 text-text-secondary">
          Pick what fits you — Filer sets up smart folder rules for each one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FREE_PACKS.map((pack) => (
          <PackButton
            key={pack}
            pack={pack}
            active={selected.includes(pack)}
            onToggle={onToggle}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button onClick={onNext} className="px-8">
          {hasSelection
            ? `Set up ${selected.length} pack${selected.length > 1 ? "s" : ""}`
            : "Skip for now"}
          <ArrowRight size={16} />
        </Button>
        {hasSelection && (
          <button
            onClick={onNext}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            You can add more packs later in Settings
          </button>
        )}
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
  const { t } = useT()
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
      <span className="text-xs font-semibold text-text-primary leading-tight">
        {t(`pack.${pack}.name`)}
      </span>
      <span className="text-[10px] text-text-secondary leading-snug line-clamp-2">
        {t(`pack.${pack}.desc`)}
      </span>
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
    <div className="flex max-w-lg flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">{t("ob.theme.title")}</h2>
        <p className="mt-2 text-text-secondary">Pick how Filer looks. You can change this any time.</p>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {FREE_THEME_KEYS.map((key) => {
          const def = THEMES[key]
          const active = theme === key
          const isLight = ["light", "warm"].includes(key)

          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                active ? "border-accent shadow-lg" : "border-border hover:border-text-secondary"
              }`}
              style={{ background: def.bg }}>
              <div className="flex gap-0.5 rounded overflow-hidden w-full h-4">
                {def.swatches.map((color, i) => (
                  <div key={i} className="flex-1" style={{ background: color }} />
                ))}
              </div>
              {active && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white">
                  <CheckCircle size={10} strokeWidth={3} />
                </span>
              )}
              <span
                className="text-[10px] font-medium truncate w-full text-center"
                style={{ color: isLight ? "#0f172a" : "#e2e8f0" }}>
                {def.label}
              </span>
            </button>
          )
        })}
      </div>

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
        <h2 className="text-2xl font-bold text-text-primary">One last step</h2>
        <p className="mt-2 text-text-secondary text-sm">
          Filer needs access to your downloads so it can rename and sort files automatically.
          It never uploads anything — everything stays on your computer.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 rounded-xl border border-border bg-bg-secondary p-4 text-left">
        {[
          { Icon: Folder,   label: "See files as they download" },
          { Icon: Sparkles, label: "Read the page title for smarter naming" },
          { Icon: Zap,      label: "Save your settings between sessions" },
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
          <CheckCircle size={16} /> All set — let's go
        </Button>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full">
          <Button className="px-8 w-full" onClick={requestPermission}>
            Allow access
          </Button>
          <button
            onClick={onEnable}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            I'll do this later
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
  const hasPacks = packs.length > 0

  return (
    <div className="flex max-w-md flex-col items-center text-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-success/20 text-success">
        <CheckCircle size={40} />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-text-primary">
          {hasPacks ? "You're all set!" : "Filer is ready"}
        </h2>
        <p className="mt-2 text-text-secondary">
          {hasPacks
            ? `${packs.length} pack${packs.length > 1 ? "s" : ""} installed. Your downloads will be organized automatically.`
            : "Your downloads will be organized automatically."}
        </p>
      </div>

      {hasPacks && (
        <div className="w-full flex flex-wrap gap-2 justify-center">
          {packs.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg-secondary px-3 py-1 text-xs text-text-secondary"
            >
              <span>{PACKS[p]?.emoji}</span>
              <span>{PACKS[p]?.label ?? p}</span>
            </span>
          ))}
        </div>
      )}

      <div className="w-full rounded-xl border border-border bg-bg-secondary p-4 text-left">
        <p className="text-xs text-text-secondary leading-relaxed">
          <span className="font-medium text-text-primary">Try it now:</span>{" "}
          download any file in Chrome. Filer will rename and sort it — no extra clicks.
        </p>
      </div>

      <Button onClick={onFinish} size="md" className="px-10">
        Open Filer <ArrowRight size={16} />
      </Button>
    </div>
  )
}
