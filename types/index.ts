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
