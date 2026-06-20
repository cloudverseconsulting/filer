import type {
  ActivityEntry,
  ConditionField,
  ConditionGroup,
  ConditionOperator,
  Rule,
  RuleCondition
} from "../types"
import { determineName, formatDate, getExtension } from "./naming"

export interface DownloadContext {
  downloadUrl: string
  originalFilename: string
  pageTitle?: string
  tabUrl?: string
  sourceDomain: string
  referrerDomain?: string
  mimeType?: string
  fileSizeMb?: number
}

export interface ProcessResult {
  finalFilename: string
  folder: string
  ruleUsed: string | null
  namingMethod: ActivityEntry["naming_method"]
  baseName: string
}

// ── Entry point ───────────────────────────────────────────────────────────────

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
      const finalFilename = applyRenameTemplate(
        rule.actions.rename_to,
        ctx,
        namingResult.baseName,
        ext,
        dateFormat,
        rule.actions.skip_rename
      )
      const folder = applyFolderTemplate(rule.actions.move_to, ctx, dateFormat)

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

// ── Rule matching ─────────────────────────────────────────────────────────────

function matchesRule(ctx: DownloadContext, rule: Rule): boolean {
  // Rule fires when ANY group matches
  return rule.condition_groups.some((g) => matchesGroup(ctx, g))
}

function matchesGroup(ctx: DownloadContext, group: ConditionGroup): boolean {
  const results = group.conditions.map((c) => matchesCondition(ctx, c))
  return group.logic === "AND" ? results.every(Boolean) : results.some(Boolean)
}

function matchesCondition(ctx: DownloadContext, cond: RuleCondition): boolean {
  const fieldVal = getFieldValue(ctx, cond.field)
  return applyOperator(fieldVal, cond.operator, cond.value)
}

function getFieldValue(ctx: DownloadContext, field: ConditionField): string {
  switch (field) {
    case "filename":
      return ctx.originalFilename.replace(/\.[^.]+$/, "").toLowerCase()
    case "file_extension":
      return getExtension(ctx.originalFilename).toLowerCase()
    case "file_size":
      return ctx.fileSizeMb != null ? String(ctx.fileSizeMb) : ""
    case "mime_type":
      return (ctx.mimeType ?? "").toLowerCase()
    case "source_domain":
      return ctx.sourceDomain.toLowerCase()
    case "full_url":
      return ctx.downloadUrl.toLowerCase()
    case "url_path": {
      try { return new URL(ctx.downloadUrl).pathname.toLowerCase() }
      catch { return ctx.downloadUrl.toLowerCase() }
    }
    case "referrer_domain":
      return (ctx.referrerDomain ?? "").toLowerCase()
    case "page_title":
      return (ctx.pageTitle ?? "").toLowerCase()
    case "download_hour":
      return String(new Date().getHours())
    case "download_day":
      return String(new Date().getDay())
    default:
      return ""
  }
}

function applyOperator(
  fieldVal: string,
  op: ConditionOperator,
  rawVal: string
): boolean {
  const val = rawVal.toLowerCase().trim()
  const parts = val.split(",").map((v) => v.trim()).filter(Boolean)

  switch (op) {
    case "contains":
      return fieldVal.includes(val)
    case "not_contains":
      return !fieldVal.includes(val)
    case "contains_any_of":
      return parts.some((p) => fieldVal.includes(p))
    case "contains_all_of":
      return parts.every((p) => fieldVal.includes(p))
    case "starts_with":
      return fieldVal.startsWith(val)
    case "ends_with":
      return fieldVal.endsWith(val)
    case "equals":
      return fieldVal === val
    case "not_equals":
      return fieldVal !== val
    case "is_any_of":
      return parts.some((p) => fieldVal === p)
    case "is_none_of":
      return !parts.some((p) => fieldVal === p)
    case "matches_regex": {
      try { return new RegExp(rawVal, "i").test(fieldVal) }
      catch { return false }
    }
    case "gt":
      return parseFloat(fieldVal) > parseFloat(val)
    case "lt":
      return parseFloat(fieldVal) < parseFloat(val)
    default:
      return false
  }
}

// ── Template application ──────────────────────────────────────────────────────

const TEMPLATE_TOKENS: Record<string, (ctx: DownloadContext, dateFormat: string) => string> = {
  "[page_title]": (ctx) => sanitize(ctx.pageTitle ?? ""),
  "[domain]":     (ctx) => friendlyDomain(ctx.sourceDomain),
  "[original]":   (ctx) => sanitize(ctx.originalFilename.replace(/\.[^.]+$/, "")),
  "[ext]":        (ctx) => getExtension(ctx.originalFilename).replace(".", ""),
  "[date]":       (_, fmt) => formatDate(new Date(), fmt),
  "[YYYY-MM-DD]": () => new Date().toISOString().split("T")[0],
  "[YYYY-MM]":    () => new Date().toISOString().slice(0, 7),
  "[YYYY]":       () => String(new Date().getFullYear()),
  "[MM]":         () => String(new Date().getMonth() + 1).padStart(2, "0"),
  "[DD]":         () => String(new Date().getDate()).padStart(2, "0"),
  "[source_path]":(ctx) => {
    try { return new URL(ctx.downloadUrl).pathname.split("/").filter(Boolean).pop() ?? "" }
    catch { return "" }
  },
}

function applyRenameTemplate(
  template: string,
  ctx: DownloadContext,
  baseName: string,
  ext: string,
  dateFormat: string,
  skipRename?: boolean
): string {
  if (skipRename) return ctx.originalFilename
  let out = template || "[page_title]_[date]"
  for (const [token, fn] of Object.entries(TEMPLATE_TOKENS)) {
    out = out.replaceAll(token, fn(ctx, dateFormat))
  }
  // [page_title] alias for baseName if not otherwise replaced
  out = out.replaceAll("[page_title]", sanitize(baseName))
  return out + ext
}

function applyFolderTemplate(folder: string, ctx: DownloadContext, dateFormat: string): string {
  let out = folder
  for (const [token, fn] of Object.entries(TEMPLATE_TOKENS)) {
    out = out.replaceAll(token, fn(ctx, dateFormat))
  }
  return out
}

function friendlyDomain(domain: string): string {
  return domain
    .replace(/^www\./, "")
    .split(".")[0]
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function sanitize(s: string): string {
  return s.replace(/[<>:"/\\|?*]/g, "_").trim()
}
