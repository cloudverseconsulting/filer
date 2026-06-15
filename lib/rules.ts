import { type ActivityEntry, type Rule } from "../types"
import { determineName, formatDate, getExtension } from "./naming"

export interface DownloadContext {
  downloadUrl: string
  originalFilename: string
  pageTitle?: string
  tabUrl?: string
  sourceDomain: string
}

export interface ProcessResult {
  finalFilename: string
  folder: string
  ruleUsed: string | null
  namingMethod: ActivityEntry["naming_method"]
  baseName: string
}

export function processDownload(
  ctx: DownloadContext,
  rules: Rule[],
  dateFormat: string
): ProcessResult {
  const ext = getExtension(ctx.originalFilename)

  const sortedRules = [...rules]
    .filter((r) => r.active)
    .sort((a, b) => a.priority - b.priority)

  for (const rule of sortedRules) {
    if (matchesRule(ctx, rule)) {
      const namingResult = determineName(ctx)
      const finalFilename = applyRuleTemplate(
        rule.actions.rename_to,
        ctx,
        namingResult.baseName,
        ext,
        dateFormat
      )
      const folder = applyFolderTemplate(rule.actions.move_to, dateFormat)

      return {
        finalFilename,
        folder,
        ruleUsed: rule.id,
        namingMethod: "rule_match",
        baseName: namingResult.baseName
      }
    }
  }

  const namingResult = determineName(ctx)
  const finalFilename = `${namingResult.baseName}_${formatDate(new Date(), dateFormat)}${ext}`

  return {
    finalFilename,
    folder: "",
    ruleUsed: null,
    namingMethod: namingResult.method,
    baseName: namingResult.baseName
  }
}

function matchesRule(ctx: DownloadContext, rule: Rule): boolean {
  const results = rule.conditions.map((condition) => {
    switch (condition.type) {
      case "source_domain":
        return condition.values.some((v) => ctx.sourceDomain.includes(v))
      case "filename_contains":
        return condition.values.some((v) =>
          ctx.originalFilename.toLowerCase().includes(v.toLowerCase())
        )
      case "file_extension":
        return condition.values.some((v) =>
          ctx.originalFilename.toLowerCase().endsWith(v.toLowerCase())
        )
      case "url_contains":
        return condition.values.some((v) =>
          ctx.downloadUrl.toLowerCase().includes(v.toLowerCase())
        )
      case "page_title_contains":
        return condition.values.some((v) =>
          ctx.pageTitle?.toLowerCase().includes(v.toLowerCase())
        )
      default:
        return false
    }
  })

  return rule.condition_logic === "ANY"
    ? results.some(Boolean)
    : results.every(Boolean)
}

function applyRuleTemplate(
  template: string,
  ctx: DownloadContext,
  baseName: string,
  ext: string,
  dateFormat: string
): string {
  const date = formatDate(new Date(), dateFormat)
  const year = new Date().getFullYear().toString()

  const out = template
    .replace("[page_title]", baseName)
    .replace("[domain]", friendlyDomain(ctx.sourceDomain))
    .replace("[YYYY-MM-DD]", date)
    .replace("[YYYY-MM]", date.substring(0, 7))
    .replace("[YYYY]", year)
    .replace("[original]", ctx.originalFilename.replace(/\.[^.]+$/, ""))

  return out + ext
}

function applyFolderTemplate(folder: string, dateFormat: string): string {
  const date = formatDate(new Date(), dateFormat)
  const year = new Date().getFullYear().toString()
  const month = date.substring(0, 7)

  return folder.replace("[YYYY-MM]", month).replace("[YYYY]", year)
}

function friendlyDomain(domain: string): string {
  return domain
    .replace("www.", "")
    .split(".")[0]
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
