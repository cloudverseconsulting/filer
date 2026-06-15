import {
  DEFAULT_SETTINGS,
  type ActivityEntry,
  type Rule,
  type UserSettings
} from "../types"

const KEYS = {
  SETTINGS: "filer_settings",
  RULES: "filer_rules",
  ACTIVITY: "filer_activity"
} as const

export async function loadSettings(): Promise<UserSettings> {
  const result = await chrome.storage.sync.get(KEYS.SETTINGS)
  return { ...DEFAULT_SETTINGS, ...(result[KEYS.SETTINGS] ?? {}) }
}

export async function saveSettings(
  settings: Partial<UserSettings>
): Promise<void> {
  const current = await loadSettings()
  await chrome.storage.sync.set({
    [KEYS.SETTINGS]: { ...current, ...settings }
  })
}

export async function loadRules(): Promise<Rule[]> {
  const result = await chrome.storage.sync.get(KEYS.RULES)
  return result[KEYS.RULES] ?? []
}

export async function saveRules(rules: Rule[]): Promise<void> {
  await chrome.storage.sync.set({ [KEYS.RULES]: rules })
}

export async function saveActivityEntry(entry: ActivityEntry): Promise<void> {
  const result = await chrome.storage.local.get(KEYS.ACTIVITY)
  const log: ActivityEntry[] = result[KEYS.ACTIVITY] ?? []
  const updated = [entry, ...log].slice(0, 500)
  await chrome.storage.local.set({ [KEYS.ACTIVITY]: updated })
}

export async function loadActivity(days?: number): Promise<ActivityEntry[]> {
  const result = await chrome.storage.local.get(KEYS.ACTIVITY)
  const log: ActivityEntry[] = result[KEYS.ACTIVITY] ?? []

  if (!days) return log

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  return log.filter((e) => new Date(e.timestamp) > cutoff)
}

export async function clearActivity(): Promise<void> {
  await chrome.storage.local.set({ [KEYS.ACTIVITY]: [] })
}

export function onSettingsChange(
  callback: (settings: UserSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "sync" && changes[KEYS.SETTINGS]) {
      callback({
        ...DEFAULT_SETTINGS,
        ...(changes[KEYS.SETTINGS].newValue ?? {})
      })
    }
  }
  chrome.storage.onChanged.addListener(listener)
  return () => chrome.storage.onChanged.removeListener(listener)
}
