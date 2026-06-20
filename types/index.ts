export type FileExtension =
  | ".pdf"
  | ".csv"
  | ".xlsx"
  | ".docx"
  | ".pptx"
  | ".zip"
  | ".png"
  | ".jpg"
  | ".jpeg"
  | ".mp4"
  | ".mp3"
  | string

// ── Condition fields — what to inspect ───────────────────────────────────────
export type ConditionField =
  // File
  | "filename"           // filename without extension
  | "file_extension"     // e.g. .pdf
  | "file_size"          // in MB — Pro
  | "mime_type"          // e.g. application/pdf — Pro
  // Source
  | "source_domain"      // e.g. stripe.com
  | "full_url"           // complete download URL
  | "url_path"           // URL path segment only
  | "referrer_domain"    // page the download was triggered from — Pro
  // Context
  | "page_title"         // browser tab title at time of download
  // Time (Pro)
  | "download_hour"      // 0–23
  | "download_day"       // 0=Sun … 6=Sat

// ── Operators — how to compare the field value ────────────────────────────────
export type ConditionOperator =
  | "contains"           // field contains value
  | "not_contains"       // field does not contain value
  | "contains_any_of"    // field contains any comma-separated item
  | "contains_all_of"    // field contains every comma-separated item — Pro
  | "starts_with"        // field starts with value
  | "ends_with"          // field ends with value
  | "equals"             // field exactly equals value
  | "not_equals"         // field does not equal value
  | "is_any_of"          // field exactly matches any comma-separated item
  | "is_none_of"         // field matches none of the comma-separated items — Pro
  | "matches_regex"      // field matches regex — Pro
  | "gt"                 // numeric: greater than
  | "lt"                 // numeric: less than

// ── A single condition row ────────────────────────────────────────────────────
export interface RuleCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string          // single value or comma-separated for *_any_of / *_all_of
}

// ── A group of conditions connected by AND or OR ──────────────────────────────
// The rule fires when ANY group fully matches (groups are always OR-ed together).
export interface ConditionGroup {
  id: string
  logic: "AND" | "OR"   // how conditions within this group are combined
  conditions: RuleCondition[]
}

// ── Actions performed when the rule matches ───────────────────────────────────
export interface RuleAction {
  rename_to: string      // rename template, e.g. "[page_title]_[date]"
  move_to: string        // destination folder, can contain [YYYY], [MM], [domain]
  skip_rename?: boolean  // move only, keep original filename
  open_after?: boolean   // Pro: open file in default app after download
  notify?: boolean       // Pro: show OS notification when rule fires
}

// ── Rule ─────────────────────────────────────────────────────────────────────
export interface Rule {
  id: string
  name: string
  description?: string
  pack?: string
  active: boolean
  priority: number
  condition_groups: ConditionGroup[]  // fires when ANY group matches
  actions: RuleAction
  created_at: string
  is_custom: boolean
}

export interface ActivityEntry {
  id: string
  timestamp: string
  original_name: string
  final_name: string
  folder: string
  source_domain: string
  source_url: string
  page_title: string
  rule_used: string | null
  rule_name?: string | null
  naming_method:
    | "page_title"
    | "url_path"
    | "domain_fallback"
    | "filename_cleanup"
    | "rule_match"
}

export type PackCategory =
  | "professional"
  | "personal"
  | "industry"
  | "hobby"
  | "meta"

export type PersonaPack =
  // ── Professional ──────────────────────────────
  | "consultant"
  | "legal"
  | "healthcare_worker"
  | "real_estate"
  | "developer"
  | "designer"
  | "photographer"
  | "marketing"
  | "hr_recruiter"
  | "architect_engineer"
  | "procurement_ops"
  | "pr_comms"
  | "researcher"
  | "accountant"
  | "financial_advisor"
  | "teacher"
  | "content_creator"
  | "personal_trainer"
  | "restaurant"
  | "logistics"
  | "social_media"
  | "executive"
  | "freelance_writer"
  | "translator"
  | "it_admin"
  | "cybersecurity"
  | "app_developer"
  | "lab_tech"
  | "cad_drafter"
  | "landscaper"
  // ── Personal ──────────────────────────────────
  | "student"
  | "personal_health"
  | "homeowner"
  | "car_owner"
  | "traveler"
  | "wedding"
  | "finance"
  | "shopper"
  | "moving"
  | "new_parent"
  | "fitness"
  | "pet_owner"
  | "job_seeker"
  | "immigration"
  | "homeschool"
  | "phd_student"
  | "property_manager"
  // ── Industry ──────────────────────────────────
  | "medical_practice"
  | "school_admin"
  | "nonprofit"
  | "manufacturing"
  | "agriculture"
  | "energy"
  | "construction"
  | "banking_fintech"
  | "insurance"
  | "biotech"
  | "retail_ecommerce"
  | "hoa"
  | "event_planner"
  | "first_responder"
  | "amazon_fba"
  | "sports_athlete"
  | "actor"
  // ── Hobby ─────────────────────────────────────
  | "professional"
  | "game_dev"
  | "writer"
  | "musician"
  | "videographer"
  | "printing_3d"
  | "food_blogger"
  | "crafter"
  | "nft_artist"
  | "board_game"
  | "chef"
  | "gardener"
  // ── Meta ──────────────────────────────────────
  | "date_first"
  | "by_source"
  | "version_control"
  | "cleanup_only"
  | "language_locale"

export type Theme =
  | "dark" | "light" | "midnight" | "forest" | "warm"
  // Pro themes
  | "heroic" | "pixel_trainer" | "pitch" | "gridiron" | "whites"
  | "cyberpunk" | "arctic" | "ember" | "sakura" | "terminal"
  | "obsidian" | "desert" | "ocean" | "neon_night" | "vintage"

export const FREE_THEMES: Theme[] = ["dark", "light", "midnight", "forest", "warm"]
export const PRO_THEMES: Theme[] = [
  "heroic", "pixel_trainer", "pitch", "gridiron", "whites",
  "cyberpunk", "arctic", "ember", "sakura", "terminal",
  "obsidian", "desert", "ocean", "neon_night", "vintage"
]

export type DateFormat = "YYYY-MM-DD" | "DD-MM-YYYY" | "MM-DD-YYYY"

export interface UserSettings {
  onboarding_complete: boolean
  active_packs: PersonaPack[]
  active_rules: string[]
  theme: Theme
  date_format: DateFormat
  enable_log: boolean
  extension_enabled: boolean
  is_paid: boolean
  language: string
}

export const DEFAULT_SETTINGS: UserSettings = {
  onboarding_complete: false,
  active_packs: [],
  active_rules: [],
  theme: "dark",
  date_format: "YYYY-MM-DD",
  enable_log: true,
  extension_enabled: true,
  is_paid: false,
  language: "en"
}
