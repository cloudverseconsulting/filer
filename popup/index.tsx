import {
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Film,
  Music,
  File as FileIcon,
  Settings as SettingsIcon,
  Folder
} from "lucide-react"
import { useEffect, useState } from "react"

import "../style.css"

import { applyTheme } from "../assets/themes"
import { I18nProvider } from "../contexts/I18nContext"
import {
  loadActivity,
  loadSettings,
  onSettingsChange,
  saveSettings
} from "../lib/storage"
import type { ActivityEntry, UserSettings } from "../types"

const VERSION = "1.0.0"

function IndexPopup() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])

  useEffect(() => {
    void refresh()
    const off = onSettingsChange((s) => {
      setSettings(s)
      applyTheme(s.theme)
    })
    return off
  }, [])

  async function refresh() {
    const [s, a] = await Promise.all([loadSettings(), loadActivity()])
    setSettings(s)
    setActivity(a)
    applyTheme(s.theme)
  }

  async function toggleEnabled() {
    if (!settings) return
    const next = !settings.extension_enabled
    setSettings({ ...settings, extension_enabled: next })
    await saveSettings({ extension_enabled: next })
  }

  function openSettings() {
    chrome.runtime.openOptionsPage()
  }

  const today = new Date().toDateString()
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const todayCount = activity.filter(
    (e) => new Date(e.timestamp).toDateString() === today
  ).length
  const weekCount = activity.filter(
    (e) => new Date(e.timestamp) > weekAgo
  ).length

  const isEnabled = settings?.extension_enabled ?? true

  return (
    <I18nProvider lang={settings?.language ?? "en"}>
    <div
      style={{ width: 320, minHeight: 480 }}
      className="bg-bg-primary text-text-primary flex flex-col">
      <Header enabled={isEnabled} onToggle={toggleEnabled} />

      {!isEnabled && <PausedBanner />}

      <StatsBar today={todayCount} week={weekCount} />

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="text-text-secondary mb-2 text-xs font-medium uppercase tracking-wider">
          Recent
        </div>
        {activity.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-2">
            {activity.slice(0, 5).map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      <Footer onOpenSettings={openSettings} />
    </div>
    </I18nProvider>
  )
}

function Header({
  enabled,
  onToggle
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-border flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="bg-accent flex h-7 w-7 items-center justify-center rounded-md text-white">
          <Folder size={16} />
        </div>
        <span className="text-base font-semibold">Filer</span>
      </div>
      <button
        onClick={onToggle}
        aria-label={enabled ? "Disable Filer" : "Enable Filer"}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          enabled ? "bg-accent" : "bg-border"
        }`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

function StatsBar({ today, week }: { today: number; week: number }) {
  return (
    <div className="border-border grid grid-cols-2 border-b">
      <StatCell value={today} label="Today" />
      <div className="border-border border-l">
        <StatCell value={week} label="This week" />
      </div>
    </div>
  )
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="px-4 py-3">
      <div className="text-xl font-semibold">{value}</div>
      <div className="text-text-secondary text-xs uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const Icon = iconForFile(entry.final_name)
  const iconColor = colorForFile(entry.final_name)
  return (
    <div className="bg-bg-card border-border flex items-start gap-2 rounded-md border p-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
        style={{ background: iconColor + "22", color: iconColor }}>
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <div
          className="truncate text-sm font-medium"
          title={entry.final_name}>
          {entry.final_name}
        </div>
        <div className="text-text-secondary mt-0.5 flex items-center gap-1.5 text-xs">
          <span className="truncate">{entry.source_domain || "local"}</span>
          <span>•</span>
          <span className="flex-shrink-0">{relativeTime(entry.timestamp)}</span>
        </div>
        <div className="mt-1.5">
          <MethodBadge method={entry.naming_method} />
        </div>
      </div>
    </div>
  )
}

function MethodBadge({ method }: { method: ActivityEntry["naming_method"] }) {
  const labels: Record<ActivityEntry["naming_method"], string> = {
    rule_match: "Rule",
    page_title: "Page Title",
    url_path: "URL",
    domain_fallback: "Domain",
    filename_cleanup: "Cleaned"
  }
  const colors: Record<ActivityEntry["naming_method"], string> = {
    rule_match: "var(--accent)",
    page_title: "var(--success)",
    url_path: "var(--warning)",
    domain_fallback: "var(--text-secondary)",
    filename_cleanup: "var(--text-secondary)"
  }
  const color = colors[method]
  return (
    <span
      className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ color, background: color + "22" }}>
      {labels[method]}
    </span>
  )
}

function PausedBanner() {
  return (
    <div className="mx-3 mt-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-center text-xs text-warning">
      Filer is paused — toggle the switch above to resume.
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-text-secondary flex flex-col items-center justify-center px-2 py-10 text-center">
      <Folder size={32} className="mb-2 opacity-50" />
      <div className="text-sm">No downloads yet.</div>
      <div className="mt-1 text-xs">
        Download a file and it'll show up here.
      </div>
    </div>
  )
}

function Footer({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="border-border border-t p-3">
      <button
        onClick={onOpenSettings}
        className="bg-bg-card hover:bg-bg-secondary border-border flex w-full items-center justify-center gap-2 rounded-md border py-2 text-sm font-medium transition-colors">
        <SettingsIcon size={14} />
        Open Settings
      </button>
      <div className="text-text-secondary mt-2 text-center text-[10px]">
        v{VERSION}
      </div>
    </div>
  )
}

function iconForFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (["xlsx", "xls", "csv"].includes(ext)) return FileSpreadsheet
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return ImageIcon
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) return FileArchive
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return Film
  if (["mp3", "wav", "flac", "m4a"].includes(ext)) return Music
  return FileIcon
}

function colorForFile(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (["xlsx", "xls", "csv"].includes(ext)) return "#10b981"
  if (["pdf"].includes(ext)) return "#e94560"
  if (["doc", "docx"].includes(ext)) return "#3b82f6"
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return "#a78bfa"
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) return "#f59e0b"
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "#ec4899"
  if (["mp3", "wav", "flac", "m4a"].includes(ext)) return "#06b6d4"
  return "#94a3b8"
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}

export default IndexPopup
