import { processDownload, type DownloadContext } from "./lib/rules"
import {
  loadRules,
  loadSettings,
  saveActivityEntry,
  saveRules
} from "./lib/storage"
import { getRulesForPacks, PACKS } from "./lib/packs"

export {}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("options.html") })
  }
})

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  ;(async () => {
    try {
      const settings = await loadSettings()

      if (!settings.extension_enabled) {
        suggest({ filename: downloadItem.filename })
        return
      }

      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const activeTab = tabs[0]

      let sourceDomain = ""
      try {
        sourceDomain = new URL(downloadItem.url).hostname.replace("www.", "")
      } catch {
        sourceDomain = ""
      }

      const ctx: DownloadContext = {
        downloadUrl: downloadItem.url,
        originalFilename: downloadItem.filename,
        pageTitle: activeTab?.title,
        tabUrl: activeTab?.url,
        sourceDomain
      }

      const rules = await loadRules()
      const result = processDownload(ctx, rules, settings.date_format)

      const fullPath = result.folder
        ? `${result.folder}${result.finalFilename}`
        : result.finalFilename

      if (settings.enable_log) {
        await saveActivityEntry({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          original_name: downloadItem.filename,
          final_name: result.finalFilename,
          folder: result.folder,
          source_domain: sourceDomain,
          source_url: downloadItem.url,
          page_title: activeTab?.title || "",
          rule_used: result.ruleUsed,
          rule_name: result.ruleUsed ? rules.find(r => r.id === result.ruleUsed)?.name ?? null : null,
          naming_method: result.namingMethod
        })
      }

      suggest({ filename: fullPath, conflictAction: "uniquify" })
    } catch (error) {
      console.error("Filer error:", error)
      suggest({ filename: downloadItem.filename })
    }
  })()

  return true
})

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "filer:install_packs") {
    ;(async () => {
      const packs = (msg.packs ?? []) as Parameters<typeof getRulesForPacks>[0]
      const rules = getRulesForPacks(packs)
      await saveRules(rules)
      sendResponse({ ok: true, count: rules.length })
    })()
    return true
  }
  if (msg?.type === "filer:list_packs") {
    sendResponse({ ok: true, packs: Object.keys(PACKS) })
    return false
  }
  return false
})
