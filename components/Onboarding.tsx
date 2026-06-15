import { ArrowRight, Folder, Shield, Sparkles, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { applyTheme, THEMES } from "../assets/themes"
import { PACKS } from "../lib/packs"
import { saveSettings } from "../lib/storage"
import type { PersonaPack, Theme } from "../types"
import { ThemeSwitcher } from "./ThemeSwitcher"
import { Button } from "./ui"

interface Props {
  onComplete: () => void
}

const ALL_PACKS = Object.keys(PACKS) as PersonaPack[]

export function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState(0)
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
      extension_enabled: true,
      onboarding_complete: false // still false until screen 5
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

  return (
    <div className="bg-bg-primary text-text-primary min-h-screen flex flex-col">
      {/* Progress dots (screens 1–4 only) */}
      {screen > 0 && screen < 4 && (
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
          <HeroScreen onNext={() => setScreen(1)} />
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
  )
}

function HeroScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex max-w-lg flex-col items-center text-center gap-6">
      {/* Icon */}
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

      {/* Visual demo */}
      <div className="w-full rounded-xl border border-border bg-bg-secondary p-4 text-left">
        <div className="flex flex-col gap-2">
          {[
            { before: "document(3).pdf", after: "Q2_Revenue_Report_2026-06-15.pdf", folder: "Finance/Invoices/" },
            { before: "export_1234567890.csv", after: "Salesforce_Report_2026-06-15.csv", folder: "Salesforce/" },
            { before: "untitled.pptx", after: "Product_Roadmap_2026-06-15.pptx", folder: "Presentations/" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary line-through opacity-60">
                {item.before}
              </span>
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
        Get Started <ArrowRight size={16} />
      </Button>
    </div>
  )
}

function PersonaScreen({
  selected,
  onToggle,
  onNext
}: {
  selected: PersonaPack[]
  onToggle: (p: PersonaPack) => void
  onNext: () => void
}) {
  const packExamples: Record<PersonaPack, string[]> = {
    consultant: ["Invoice Detection", "Contract Detection", "Salesforce Export"],
    student: ["Lecture Slides", "Assignment Files", "Research Papers"],
    finance: ["Payment Receipts", "Bank Statements", "Tax Documents"],
    shopper: ["Order Confirmations", "Return Labels", "Receipts"],
    professional: ["Presentations", "Spreadsheets", "Archives"]
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          What kind of files do you download most?
        </h2>
        <p className="mt-2 text-text-secondary">
          Pick one or more to start. You can always add more later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALL_PACKS.map((pack) => {
          const def = PACKS[pack]
          const active = selected.includes(pack)
          return (
            <button
              key={pack}
              onClick={() => onToggle(pack)}
              className={`relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-accent bg-accent/10 shadow-lg"
                  : "border-border bg-bg-card hover:bg-bg-secondary"
              }`}>
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white">
                  ✓
                </span>
              )}
              <span className="text-2xl">{def.emoji}</span>
              <span className="text-sm font-semibold text-text-primary">
                {def.label}
              </span>
              <div className="flex flex-col gap-0.5">
                {packExamples[pack].map((ex) => (
                  <span key={ex} className="text-[11px] text-text-secondary">
                    · {ex}
                  </span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onNext}
          disabled={selected.length === 0}
          className="px-8">
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function ThemeScreen({
  theme,
  onChange,
  onNext
}: {
  theme: Theme
  onChange: (t: Theme) => void
  onNext: () => void
}) {
  return (
    <div className="flex max-w-xl flex-col gap-6 w-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-text-primary">Pick your look.</h2>
        <p className="mt-2 text-text-secondary">
          You can change this anytime in settings.
        </p>
      </div>

      <ThemeSwitcher current={theme} onChange={onChange} />

      {/* Live preview label */}
      <p className="text-center text-xs text-text-secondary">
        Previewing:{" "}
        <span className="font-medium text-text-primary">
          {THEMES[theme].label}
        </span>
      </p>

      <div className="flex justify-center">
        <Button onClick={onNext} className="px-8">
          Continue <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}

function PermissionScreen({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="flex max-w-lg flex-col gap-6 text-center">
      <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-success/20 text-success">
        <Shield size={40} />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-text-primary">
          One permission. That's it.
        </h2>
        <p className="mt-2 text-text-secondary">
          Filer only needs access to your downloads.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-5 text-left flex flex-col gap-3">
        {[
          {
            icon: "✅",
            text: "Sees the filename and where it came from"
          },
          {
            icon: "✅",
            text: "Renames and routes files before they land"
          },
          {
            icon: "❌",
            text: "Never reads file contents"
          },
          {
            icon: "❌",
            text: "Never uploads anything"
          },
          {
            icon: "❌",
            text: "No account required"
          }
        ].map((item) => (
          <div key={item.text} className="flex items-start gap-2 text-sm">
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="text-text-secondary">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onEnable} className="w-full py-3 text-base">
          <Zap size={18} /> Enable Filer
        </Button>
        <p className="text-xs text-text-secondary">
          All processing happens locally in your browser.
        </p>
      </div>
    </div>
  )
}

function ReadyScreen({
  packs,
  onFinish
}: {
  packs: PersonaPack[]
  onFinish: () => void
}) {
  const firstPack = packs[0]
  const packDef = firstPack ? PACKS[firstPack] : null

  return (
    <div className="flex max-w-lg flex-col gap-6 text-center">
      <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-success/20 text-success">
        <Sparkles size={40} />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-text-primary">You're all set.</h2>
        <p className="mt-2 text-text-secondary">
          {packs.length} pack{packs.length !== 1 ? "s" : ""} activated with{" "}
          {packs.reduce((n, p) => n + PACKS[p].rules.length, 0)} rules.
        </p>
      </div>

      {packDef && packDef.rules.length > 0 && (
        <div className="rounded-xl border border-border bg-bg-secondary p-4 text-left">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
            {packDef.emoji} {packDef.label}
          </p>
          <div className="flex flex-col gap-1.5">
            {packDef.rules.slice(0, 4).map((rule) => (
              <div key={rule.id} className="flex items-center gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-success flex-shrink-0" />
                <span className="text-text-primary">{rule.name}</span>
                <span className="text-text-secondary">→ {rule.actions.move_to}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          Download something to try it out.
        </div>
        <Button onClick={onFinish} className="w-full">
          Explore all settings →
        </Button>
      </div>
    </div>
  )
}
