import { domainMap } from "./domains"

const TITLE_BLACKLIST = [
  "notion",
  "google drive",
  "dropbox",
  "untitled",
  "home",
  "dashboard",
  "new tab",
  "loading",
  "google docs",
  "google sheets",
  "onedrive",
  "sharepoint",
  "box",
  "figma",
  "github",
  "sign in",
  "login",
  "untitled document",
  "untitled spreadsheet"
]

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const HASH_PATTERN = /^[0-9a-f]{16,}$/i
const TIMESTAMP_PATTERN = /^\d{10,13}$/
const GENERIC_NAMES = [
  "document",
  "file",
  "download",
  "export",
  "unnamed",
  "untitled"
]

export interface NamingContext {
  downloadUrl: string
  originalFilename: string
  pageTitle?: string
  tabUrl?: string
}

export interface NamingResult {
  baseName: string
  method: "page_title" | "url_path" | "domain_fallback" | "filename_cleanup"
  confidence: "high" | "medium" | "low"
}

export function determineName(ctx: NamingContext): NamingResult {
  const fromTitle = extractFromPageTitle(ctx.pageTitle)
  if (fromTitle) {
    return { baseName: fromTitle, method: "page_title", confidence: "high" }
  }

  const fromUrl = extractFromUrl(ctx.downloadUrl)
  if (fromUrl) {
    return { baseName: fromUrl, method: "url_path", confidence: "medium" }
  }

  const fromDomain = extractFromDomain(ctx.downloadUrl, ctx.originalFilename)
  if (fromDomain) {
    return {
      baseName: fromDomain,
      method: "domain_fallback",
      confidence: "medium"
    }
  }

  const fromFilename = cleanOriginalFilename(ctx.originalFilename)
  return {
    baseName: fromFilename,
    method: "filename_cleanup",
    confidence: "low"
  }
}

function extractFromPageTitle(title?: string): string | null {
  if (!title) return null

  let cleaned = title
    .replace(
      /[-|–—]\s*(Google Drive|Notion|Dropbox|OneDrive|SharePoint|Box|Figma|GitHub|GitLab).*$/i,
      ""
    )
    .replace(/\s*[-|–—]\s*.*$/, "")
    .trim()

  const lower = cleaned.toLowerCase()

  if (TITLE_BLACKLIST.some((b) => lower === b || lower.startsWith(b)))
    return null
  if (cleaned.length < 3) return null

  if (cleaned.length > 50) {
    cleaned = cleaned.substring(0, 50).replace(/\s+\S*$/, "")
  }

  return toSnakeCase(cleaned)
}

function extractFromUrl(url: string): string | null {
  // blob: URLs have the originating URL baked into their pathname — skip them
  if (url.startsWith("blob:")) return null

  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split("/").filter(Boolean)

    for (let i = segments.length - 1; i >= 0; i--) {
      let segment = segments[i]
      segment = segment.replace(/\.[^.]+$/, "")

      if (UUID_PATTERN.test(segment)) continue
      if (HASH_PATTERN.test(segment)) continue
      if (TIMESTAMP_PATTERN.test(segment)) continue
      if (segment.length < 3) continue  // allow short but meaningful names (e.g. "app", "v1")
      if (/^\d+$/.test(segment)) continue
      if (GENERIC_NAMES.includes(segment.toLowerCase())) continue
      if (!/[aeiou]/i.test(segment) && segment.length > 8) continue

      return toSnakeCase(decodeURIComponent(segment))
    }
  } catch {}
  return null
}

function extractFromDomain(url: string, filename: string): string | null {
  if (url.startsWith("blob:")) return null

  try {
    const parsed = new URL(url)
    const domain = parsed.hostname.replace("www.", "")
    const ext = getExtension(filename)

    const friendlyDomain = domainMap[domain] || toTitleCase(domain.split(".")[0])
    const fileType = extensionToType(ext)

    return `${friendlyDomain}_${fileType}`
  } catch {}
  return null
}

function cleanOriginalFilename(filename: string): string {
  let name = filename.replace(/\.[^.]+$/, "")

  name = name.replace(/\s*\(\d+\)\s*$/, "")
  name = name.replace(/_\d{10,13}/g, "")
  name = name.replace(/\d{10,13}/g, "")
  name = name.replace(/[_-][0-9a-f]{8,}/gi, "")
  name = name.replace(/[_-]+/g, "_").trim()

  if (name.length < 3 || GENERIC_NAMES.includes(name.toLowerCase())) {
    return "File"
  }

  return toSnakeCase(name)
}

export function assembleFilename(
  baseName: string,
  extension: string,
  dateFormat: string,
  existingFiles: string[] = []
): string {
  const date = formatDate(new Date(), dateFormat)
  let filename = `${baseName}_${date}${extension}`

  if (existingFiles.includes(filename)) {
    let counter = 2
    while (
      existingFiles.includes(`${baseName}_${date}_${counter}${extension}`)
    ) {
      counter++
    }
    filename = `${baseName}_${date}_${counter}${extension}`
  }

  return filename
}

function toSnakeCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .replace(/[\s\-]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "")
    .trim()
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/)
  return match ? match[0].toLowerCase() : ""
}

function extensionToType(ext: string): string {
  const map: Record<string, string> = {
    ".pdf": "Document",
    ".doc": "Document",
    ".docx": "Document",
    ".xls": "Spreadsheet",
    ".xlsx": "Spreadsheet",
    ".csv": "Spreadsheet",
    ".ppt": "Presentation",
    ".pptx": "Presentation",
    ".zip": "Archive",
    ".rar": "Archive",
    ".tar": "Archive",
    ".jpg": "Image",
    ".jpeg": "Image",
    ".png": "Image",
    ".gif": "Image",
    ".mp4": "Video",
    ".mov": "Video",
    ".avi": "Video",
    ".mp3": "Audio",
    ".wav": "Audio"
  }
  return map[ext] || "File"
}

export function formatDate(date: Date, format: string): string {
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, "0")
  const D = String(date.getDate()).padStart(2, "0")

  return format
    .replace("YYYY", String(Y))
    .replace("MM", M)
    .replace("DD", D)
}
