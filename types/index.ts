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

export type ConditionType =
  | "source_domain"
  | "filename_contains"
  | "file_extension"
  | "url_contains"
  | "page_title_contains"

export type ConditionLogic = "ANY" | "ALL"

export interface RuleCondition {
  type: ConditionType
  values: string[]
}

export interface RuleAction {
  rename_to: string
  move_to: string
}

export interface Rule {
  id: string
  name: string
  pack?: string
  active: boolean
  priority: number
  conditions: RuleCondition[]
  condition_logic: ConditionLogic
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
  naming_method:
    | "page_title"
    | "url_path"
    | "domain_fallback"
    | "filename_cleanup"
    | "rule_match"
}

export type PersonaPack =
  | "consultant"
  | "student"
  | "finance"
  | "shopper"
  | "professional"

export type Theme = "dark" | "light" | "midnight" | "forest" | "warm"

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
}

export const DEFAULT_SETTINGS: UserSettings = {
  onboarding_complete: false,
  active_packs: [],
  active_rules: [],
  theme: "dark",
  date_format: "YYYY-MM-DD",
  enable_log: true,
  extension_enabled: true,
  is_paid: false
}
