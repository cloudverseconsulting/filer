import type {
  ConditionLogic,
  PackCategory,
  PersonaPack,
  Rule,
  RuleCondition
} from "../types"

// ── Condition shorthand helpers ───────────────────────────────────────────────
const D = (values: string[]): RuleCondition => ({ type: "source_domain", values })
const F = (values: string[]): RuleCondition => ({ type: "filename_contains", values })
const E = (values: string[]): RuleCondition => ({ type: "file_extension", values })
const U = (values: string[]): RuleCondition => ({ type: "url_contains", values })

function now() { return new Date().toISOString() }

function r(
  id: string,
  name: string,
  pack: PersonaPack,
  conditions: RuleCondition[],
  logic: ConditionLogic,
  rename: string,
  folder: string,
  priority: number
): Rule {
  return {
    id, name, pack,
    active: true, priority, conditions,
    condition_logic: logic,
    actions: { rename_to: rename, move_to: folder },
    is_custom: false,
    created_at: now()
  }
}

// ── Pack definition type ──────────────────────────────────────────────────────
export interface PackDef {
  label: string
  emoji: string
  description: string
  category: PackCategory
  rules: Rule[]
}

// ── All 77 packs ─────────────────────────────────────────────────────────────
export const PACKS: Record<PersonaPack, PackDef> = {

  // ════════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL
  // ════════════════════════════════════════════════════════════════════════════

  consultant: {
    label: "Consultant & Freelancer", emoji: "💼",
    description: "Invoices, contracts, proposals, client deliverables",
    category: "professional",
    rules: [
      r("con_001", "Invoice Detection", "consultant",
        [F(["invoice", "inv_", "bill"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 1),
      r("con_002", "Contract Detection", "consultant",
        [F(["contract", "agreement", "sow", "nda", "msa"]),
         D(["docusign.net", "hellosign.com", "pandadoc.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 2),
      r("con_003", "Proposal", "consultant",
        [F(["proposal", "quote", "rfp", "rfq"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Proposals/", 3),
      r("con_004", "Salesforce Export", "consultant",
        [D(["salesforce.com", "force.com"])], "ANY",
        "SF_[page_title]_[YYYY-MM-DD]", "Salesforce/", 4),
    ]
  },

  legal: {
    label: "Legal Professional", emoji: "⚖️",
    description: "Briefs, pleadings, depositions, case files, court orders",
    category: "professional",
    rules: [
      r("leg_001", "Court Filing", "legal",
        [F(["brief", "motion", "pleading", "filing", "complaint", "petition"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Cases/Filings/", 1),
      r("leg_002", "Deposition / Transcript", "legal",
        [F(["deposition", "transcript", "testimony"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Cases/Transcripts/", 2),
      r("leg_003", "Contract & Agreement", "legal",
        [F(["contract", "agreement", "nda", "retainer", "engagement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 3),
      r("leg_004", "Court Order / Judgment", "legal",
        [F(["order", "judgment", "decree", "ruling", "opinion"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Cases/Orders/", 4),
      r("leg_005", "E-Filing Platform", "legal",
        [D(["pacer.gov", "ecf.uscourts.gov", "casetext.com", "westlaw.com", "lexisnexis.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Cases/Research/", 5),
    ]
  },

  healthcare_worker: {
    label: "Healthcare Worker", emoji: "🏥",
    description: "Clinical guidelines, patient forms, insurance, compliance",
    category: "professional",
    rules: [
      r("hcw_001", "Clinical Guidelines", "healthcare_worker",
        [F(["guideline", "protocol", "sop", "clinical"]),
         D(["uptodate.com", "cdc.gov", "who.int", "nih.gov"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clinical/Guidelines/", 1),
      r("hcw_002", "Insurance & Billing", "healthcare_worker",
        [F(["eob", "remittance", "claim", "billing", "superbill"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Billing/", 2),
      r("hcw_003", "Compliance & Licensing", "healthcare_worker",
        [F(["hipaa", "compliance", "license", "certification", "ceu"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 3),
      r("hcw_004", "Patient Forms", "healthcare_worker",
        [F(["patient", "intake", "consent", "referral", "discharge"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Patient Forms/", 4),
    ]
  },

  real_estate: {
    label: "Real Estate Agent", emoji: "🏠",
    description: "Listings, inspection reports, closing docs, MLS exports",
    category: "professional",
    rules: [
      r("re_001", "Listing Documents", "real_estate",
        [F(["listing", "mls", "property"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Listings/", 1),
      r("re_002", "Inspection Report", "real_estate",
        [F(["inspection", "appraisal", "survey"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Inspections/", 2),
      r("re_003", "Closing Package", "real_estate",
        [F(["closing", "settlement", "hud", "deed", "title", "escrow"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Closings/", 3),
      r("re_004", "Purchase Agreement", "real_estate",
        [F(["contract", "offer", "purchase agreement", "addendum"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 4),
      r("re_005", "MLS / DocuSign", "real_estate",
        [D(["matrix.mlslistings.com", "flexmls.com", "docusign.net", "dotloop.com", "ziplogix.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "MLS/", 5),
    ]
  },

  developer: {
    label: "Software Developer", emoji: "🧑‍💻",
    description: "GitHub releases, logs, API exports, design handoffs",
    category: "professional",
    rules: [
      r("dev_001", "GitHub Release", "developer",
        [D(["github.com"]), U(["releases/download"])], "ALL",
        "[page_title]_[YYYY-MM-DD]", "Downloads/GitHub/", 1),
      r("dev_002", "Log File", "developer",
        [E([".log", ".txt"]), F(["log", "error", "debug", "trace"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Logs/", 2),
      r("dev_003", "API / Data Export", "developer",
        [E([".json", ".csv", ".xml"]), F(["export", "api", "dump", "backup"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Data/", 3),
      r("dev_004", "Design Handoff", "developer",
        [D(["figma.com", "zeplin.io", "invision.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/", 4),
      r("dev_005", "Package / Archive", "developer",
        [E([".zip", ".tar", ".gz", ".tgz", ".whl", ".vsix", ".deb", ".rpm"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Packages/", 5),
    ]
  },

  designer: {
    label: "Designer / Creative", emoji: "🎨",
    description: "Briefs, client feedback, brand assets, invoices",
    category: "professional",
    rules: [
      r("des_001", "Brand Assets", "designer",
        [E([".ai", ".eps", ".svg", ".fig"]), F(["brand", "logo", "asset", "style guide"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Assets/Brand/", 1),
      r("des_002", "Client Brief", "designer",
        [F(["brief", "creative brief", "spec", "scope"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Briefs/", 2),
      r("des_003", "Figma / Adobe Export", "designer",
        [D(["figma.com", "adobe.com", "canva.com", "sketch.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/Exports/", 3),
      r("des_004", "Client Invoice", "designer",
        [F(["invoice", "quote", "estimate"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 4),
      r("des_005", "Stock / Font Download", "designer",
        [D(["shutterstock.com", "unsplash.com", "fonts.google.com", "myfonts.com", "adobe.com/fonts"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Assets/Stock/", 5),
    ]
  },

  photographer: {
    label: "Photographer", emoji: "📸",
    description: "RAW exports, client galleries, model releases, invoices",
    category: "professional",
    rules: [
      r("pho_001", "RAW / High-Res Export", "photographer",
        [E([".raw", ".cr2", ".cr3", ".nef", ".arw", ".dng"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Photos/RAW/", 1),
      r("pho_002", "Client Gallery", "photographer",
        [D(["pixieset.com", "shootproof.com", "smugmug.com", "cloudspot.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Galleries/", 2),
      r("pho_003", "Model Release / Contract", "photographer",
        [F(["release", "model release", "property release", "contract"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 3),
      r("pho_004", "Invoice", "photographer",
        [F(["invoice", "quote", "estimate"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 4),
      r("pho_005", "Lightroom / Capture Export", "photographer",
        [E([".lrcat", ".lrtemplate", ".xmp", ".preset"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Photos/Presets/", 5),
    ]
  },

  marketing: {
    label: "Marketing & Growth", emoji: "📊",
    description: "Campaign reports, analytics exports, creative briefs, ad spend",
    category: "professional",
    rules: [
      r("mkt_001", "Analytics Export", "marketing",
        [D(["analytics.google.com", "ads.google.com", "facebook.com/ads", "meta.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Analytics/", 1),
      r("mkt_002", "Campaign Report", "marketing",
        [F(["campaign", "report", "performance", "attribution"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Reports/Campaigns/", 2),
      r("mkt_003", "Creative Asset", "marketing",
        [F(["creative", "banner", "ad", "social post", "thumbnail"]),
         E([".png", ".jpg", ".mp4", ".gif"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Creatives/", 3),
      r("mkt_004", "Email / CRM Export", "marketing",
        [D(["mailchimp.com", "klaviyo.com", "hubspot.com", "activecampaign.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "CRM/Exports/", 4),
      r("mkt_005", "Content Brief", "marketing",
        [F(["brief", "content plan", "editorial calendar", "strategy"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Strategy/", 5),
    ]
  },

  hr_recruiter: {
    label: "HR & Recruiter", emoji: "🏋️",
    description: "Resumes, offer letters, onboarding docs, compliance forms",
    category: "professional",
    rules: [
      r("hr_001", "Resume / CV", "hr_recruiter",
        [F(["resume", "cv", "curriculum vitae"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Recruiting/Resumes/", 1),
      r("hr_002", "Offer Letter", "hr_recruiter",
        [F(["offer", "offer letter", "employment agreement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Offers/", 2),
      r("hr_003", "Onboarding Documents", "hr_recruiter",
        [F(["onboarding", "i-9", "w-4", "w4", "direct deposit", "handbook"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Onboarding/", 3),
      r("hr_004", "Payroll Export", "hr_recruiter",
        [D(["adp.com", "gusto.com", "rippling.com", "workday.com", "bamboohr.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Payroll/", 4),
      r("hr_005", "Performance Review", "hr_recruiter",
        [F(["performance review", "evaluation", "pip", "360"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Reviews/", 5),
    ]
  },

  architect_engineer: {
    label: "Architect / Engineer", emoji: "🏗️",
    description: "CAD files, permits, RFIs, submittal packages",
    category: "professional",
    rules: [
      r("ae_001", "CAD / Drawing File", "architect_engineer",
        [E([".dwg", ".dxf", ".rvt", ".rfa", ".skp", ".ifc"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Drawings/", 1),
      r("ae_002", "Permit & Approval", "architect_engineer",
        [F(["permit", "approval", "variance", "entitlement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Permits/", 2),
      r("ae_003", "RFI / Submittal", "architect_engineer",
        [F(["rfi", "submittal", "transmittal", "shop drawing"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/RFIs/", 3),
      r("ae_004", "Specification", "architect_engineer",
        [F(["spec", "specification", "division"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/Specs/", 4),
    ]
  },

  procurement_ops: {
    label: "Procurement & Ops", emoji: "🛒",
    description: "POs, vendor quotes, shipping docs, inventory reports",
    category: "professional",
    rules: [
      r("po_001", "Purchase Order", "procurement_ops",
        [F(["purchase order", "po_", " po ", "p.o."])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Procurement/POs/", 1),
      r("po_002", "Vendor Quote", "procurement_ops",
        [F(["quote", "quotation", "rfq", "estimate"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Procurement/Quotes/", 2),
      r("po_003", "Shipping & Logistics", "procurement_ops",
        [F(["bol", "bill of lading", "waybill", "packing list", "asn"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shipping/", 3),
      r("po_004", "Inventory Report", "procurement_ops",
        [F(["inventory", "stock", "warehouse"]), E([".csv", ".xlsx"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Inventory/Reports/", 4),
    ]
  },

  pr_comms: {
    label: "PR & Communications", emoji: "📣",
    description: "Press releases, media kits, coverage reports",
    category: "professional",
    rules: [
      r("pr_001", "Press Release", "pr_comms",
        [F(["press release", "pr_", "media release"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "PR/Press Releases/", 1),
      r("pr_002", "Media Kit", "pr_comms",
        [F(["media kit", "press kit", "brand kit"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "PR/Media Kits/", 2),
      r("pr_003", "Coverage Report", "pr_comms",
        [F(["coverage", "clippings", "mentions", "media report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "PR/Coverage/", 3),
      r("pr_004", "Influencer Contract", "pr_comms",
        [F(["influencer", "partnership", "sponsorship", "collaboration"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "PR/Contracts/", 4),
    ]
  },

  researcher: {
    label: "Researcher / Academic", emoji: "🧪",
    description: "Papers, datasets, IRB docs, grant applications",
    category: "professional",
    rules: [
      r("res_001", "Research Paper", "researcher",
        [D(["arxiv.org", "scholar.google.com", "researchgate.net", "jstor.org", "pubmed.ncbi.nlm.nih.gov", "semanticscholar.org"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/Papers/", 1),
      r("res_002", "Dataset", "researcher",
        [F(["dataset", "data_", "_data"]), E([".csv", ".json", ".parquet", ".h5"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/Datasets/", 2),
      r("res_003", "Grant Application", "researcher",
        [F(["grant", "nsf", "nih", "proposal", "funding"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/Grants/", 3),
      r("res_004", "IRB / Ethics Approval", "researcher",
        [F(["irb", "ethics", "protocol", "consent form"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/IRB/", 4),
    ]
  },

  accountant: {
    label: "Accountant / Bookkeeper", emoji: "🧾",
    description: "Bank recs, trial balances, client tax docs, journal entries",
    category: "professional",
    rules: [
      r("acc_001", "Bank Reconciliation", "accountant",
        [F(["bank rec", "reconciliation", "statement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Accounting/BankRecs/", 1),
      r("acc_002", "Trial Balance / Financials", "accountant",
        [F(["trial balance", "balance sheet", "income statement", "p&l", "profit and loss"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Accounting/Financials/", 2),
      r("acc_003", "QuickBooks / Xero Export", "accountant",
        [D(["quickbooks.intuit.com", "xero.com", "freshbooks.com", "sage.com", "wave.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Accounting/Exports/", 3),
      r("acc_004", "Tax Return / Filing", "accountant",
        [F(["tax return", "1040", "1120", "990", "w2", "1099", "schedule"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Tax/[YYYY]/", 4),
    ]
  },

  financial_advisor: {
    label: "Financial Advisor", emoji: "🏦",
    description: "Portfolio reports, client statements, compliance docs",
    category: "professional",
    rules: [
      r("fa_001", "Portfolio Report", "financial_advisor",
        [F(["portfolio", "performance report", "holdings"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Reports/", 1),
      r("fa_002", "Client Statement", "financial_advisor",
        [D(["schwab.com", "fidelity.com", "vanguard.com", "morningstar.com", "bloomberg.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Statements/", 2),
      r("fa_003", "Compliance Document", "financial_advisor",
        [F(["compliance", "aml", "kyc", "sec", "finra", "crs", "adv"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 3),
      r("fa_004", "Financial Plan", "financial_advisor",
        [F(["financial plan", "retirement plan", "estate plan", "proposal"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Plans/", 4),
    ]
  },

  teacher: {
    label: "Teacher / Educator", emoji: "🧑‍🏫",
    description: "Lesson plans, rubrics, student work, grade exports",
    category: "professional",
    rules: [
      r("tch_001", "Lesson Plan", "teacher",
        [F(["lesson plan", "unit plan", "curriculum"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Teaching/Lessons/", 1),
      r("tch_002", "Rubric / Assessment", "teacher",
        [F(["rubric", "assessment", "quiz", "test", "exam"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Teaching/Assessments/", 2),
      r("tch_003", "Grade Export", "teacher",
        [D(["canvas.instructure.com", "classroom.google.com", "schoology.com", "powerschool.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Teaching/Grades/", 3),
      r("tch_004", "Student Submission", "teacher",
        [F(["submission", "student work", "assignment"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Teaching/Submissions/", 4),
    ]
  },

  content_creator: {
    label: "Podcaster / YouTuber", emoji: "🎙️",
    description: "Episode files, transcripts, sponsorship contracts, analytics",
    category: "professional",
    rules: [
      r("cc_001", "Audio / Episode File", "content_creator",
        [E([".mp3", ".wav", ".aac", ".m4a"]), F(["episode", "ep_", "podcast"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Podcast/Episodes/", 1),
      r("cc_002", "Transcript", "content_creator",
        [F(["transcript", "captions", "subtitles"]), E([".srt", ".vtt", ".txt"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Podcast/Transcripts/", 2),
      r("cc_003", "Sponsorship Contract", "content_creator",
        [F(["sponsor", "sponsorship", "brand deal", "partnership"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Contracts/", 3),
      r("cc_004", "Analytics Export", "content_creator",
        [D(["studio.youtube.com", "analytics.spotify.com", "podtrac.com", "chartable.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Analytics/", 4),
    ]
  },

  personal_trainer: {
    label: "Personal Trainer", emoji: "🏋️",
    description: "Client programs, waivers, progress reports, certifications",
    category: "professional",
    rules: [
      r("pt_001", "Training Program", "personal_trainer",
        [F(["program", "training plan", "workout plan", "periodization"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Programs/", 1),
      r("pt_002", "Liability Waiver", "personal_trainer",
        [F(["waiver", "liability", "consent", "intake form"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Waivers/", 2),
      r("pt_003", "Certification", "personal_trainer",
        [F(["certification", "ceu", "nasm", "ace", "nsca", "issa"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Certifications/", 3),
      r("pt_004", "Client Progress Report", "personal_trainer",
        [F(["progress", "assessment", "body composition", "check-in"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Progress/", 4),
    ]
  },

  restaurant: {
    label: "Restaurant / Hospitality", emoji: "🍽️",
    description: "Vendor invoices, health inspections, staff schedules, menus",
    category: "professional",
    rules: [
      r("rst_001", "Vendor Invoice", "restaurant",
        [F(["invoice", "delivery", "purveyors", "sysco", "us foods"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Vendor Invoices/", 1),
      r("rst_002", "Health Inspection", "restaurant",
        [F(["inspection", "health permit", "food safety", "haccp"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/Inspections/", 2),
      r("rst_003", "Staff Schedule", "restaurant",
        [F(["schedule", "rota", "roster", "shift"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Schedules/", 3),
      r("rst_004", "Menu / Recipe", "restaurant",
        [F(["menu", "recipe", "allergen"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Operations/Menus/", 4),
    ]
  },

  logistics: {
    label: "Logistics / Supply Chain", emoji: "🚚",
    description: "BOLs, customs docs, tracking exports, carrier invoices",
    category: "professional",
    rules: [
      r("log_001", "Bill of Lading", "logistics",
        [F(["bill of lading", "bol", "waybill", "airway bill"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shipping/BOLs/", 1),
      r("log_002", "Customs Document", "logistics",
        [F(["customs", "commercial invoice", "packing list", "certificate of origin"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shipping/Customs/", 2),
      r("log_003", "Carrier Invoice", "logistics",
        [D(["fedex.com", "ups.com", "dhl.com", "freightos.com", "flexport.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Carrier Invoices/", 3),
      r("log_004", "Tracking / Manifest", "logistics",
        [F(["manifest", "tracking", "shipment report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shipping/Manifests/", 4),
    ]
  },

  social_media: {
    label: "Social Media Manager", emoji: "📱",
    description: "Content calendars, brand assets, analytics, influencer contracts",
    category: "professional",
    rules: [
      r("sm_001", "Content Calendar", "social_media",
        [F(["content calendar", "editorial", "social plan", "content plan"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Strategy/Calendars/", 1),
      r("sm_002", "Analytics Report", "social_media",
        [D(["later.com", "buffer.com", "hootsuite.com", "sproutsocial.com", "iconosquare.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Analytics/", 2),
      r("sm_003", "Creative Asset", "social_media",
        [F(["post", "story", "reel", "creative", "thumbnail"]),
         E([".png", ".jpg", ".mp4", ".gif"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Creatives/", 3),
      r("sm_004", "Influencer Contract", "social_media",
        [F(["influencer", "ugc", "partnership", "brief"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 4),
    ]
  },

  executive: {
    label: "Executive / PA", emoji: "🧑‍💼",
    description: "Board decks, NDA packages, travel briefs, expense reports",
    category: "professional",
    rules: [
      r("ex_001", "Board Deck", "executive",
        [F(["board", "deck", "board deck", "presentation", "board meeting"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Board/", 1),
      r("ex_002", "NDA / Confidential", "executive",
        [F(["nda", "confidential", "non-disclosure"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Legal/NDAs/", 2),
      r("ex_003", "Travel Brief / Itinerary", "executive",
        [F(["itinerary", "travel brief", "trip", "flight", "hotel"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Travel/", 3),
      r("ex_004", "Expense Report", "executive",
        [F(["expense report", "expenses", "reimbursement"]),
         D(["concur.com", "expensify.com", "ramp.com", "brex.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Expenses/", 4),
    ]
  },

  freelance_writer: {
    label: "Freelance Writer", emoji: "✍️",
    description: "Pitches, assignments, drafts, invoices, published clips",
    category: "professional",
    rules: [
      r("fw_001", "Article Draft", "freelance_writer",
        [F(["draft", "article", "piece", "copy"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Writing/Drafts/", 1),
      r("fw_002", "Editorial Brief", "freelance_writer",
        [F(["brief", "assignment", "pitch", "outline"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Writing/Briefs/", 2),
      r("fw_003", "Invoice", "freelance_writer",
        [F(["invoice", "payment", "rate"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 3),
      r("fw_004", "Contract / Agreement", "freelance_writer",
        [F(["contract", "agreement", "terms", "kill fee"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 4),
    ]
  },

  translator: {
    label: "Translator / Interpreter", emoji: "🌐",
    description: "Source documents, deliverables, CAT tool exports, contracts",
    category: "professional",
    rules: [
      r("tr_001", "Source Document", "translator",
        [F(["source", "original", "to translate", "for translation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/Source/", 1),
      r("tr_002", "Translation Deliverable", "translator",
        [F(["translated", "delivery", "final", "approved"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/Delivered/", 2),
      r("tr_003", "CAT Tool Export", "translator",
        [E([".xliff", ".sdlxliff", ".tmx", ".tbx", ".po"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/CAT/", 3),
      r("tr_004", "Invoice", "translator",
        [F(["invoice", "rate", "word count", "quote"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 4),
    ]
  },

  it_admin: {
    label: "IT Admin / SysAdmin", emoji: "💻",
    description: "Server logs, compliance reports, software licenses, audit exports",
    category: "professional",
    rules: [
      r("it_001", "Server / System Log", "it_admin",
        [F(["syslog", "server log", "error log", "access log"]),
         E([".log", ".gz"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Logs/", 1),
      r("it_002", "Software License", "it_admin",
        [F(["license", "license key", "serial", "activation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Licenses/", 2),
      r("it_003", "Audit / Compliance Report", "it_admin",
        [F(["audit", "compliance", "soc2", "iso27001", "hipaa", "security report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 3),
      r("it_004", "Network / Config Export", "it_admin",
        [F(["config", "backup", "export"]), E([".cfg", ".conf", ".yaml", ".json"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Configs/", 4),
    ]
  },

  cybersecurity: {
    label: "Cybersecurity Analyst", emoji: "🛡️",
    description: "Vulnerability reports, pentest exports, compliance audits, incident logs",
    category: "professional",
    rules: [
      r("cy_001", "Vulnerability Report", "cybersecurity",
        [F(["vuln", "vulnerability", "cve", "pentest", "penetration test"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Security/Vulns/", 1),
      r("cy_002", "Audit / Compliance", "cybersecurity",
        [F(["audit", "soc2", "pci", "iso27001", "nist", "gdpr"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 2),
      r("cy_003", "Incident Report", "cybersecurity",
        [F(["incident", "breach", "alert", "ioc", "threat"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Incidents/", 3),
      r("cy_004", "SIEM / Tool Export", "cybersecurity",
        [D(["splunk.com", "crowdstrike.com", "sentinelone.com", "tenable.com", "qualys.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Tools/Exports/", 4),
    ]
  },

  app_developer: {
    label: "App Developer", emoji: "📱",
    description: "TestFlight builds, App Store assets, rejection letters, analytics",
    category: "professional",
    rules: [
      r("ad_001", "App Build / IPA / APK", "app_developer",
        [E([".ipa", ".apk", ".aab"]), F(["build", "release", "testflight"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Builds/", 1),
      r("ad_002", "App Store / Play Store Assets", "app_developer",
        [D(["appstoreconnect.apple.com", "play.google.com/console"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Store/Assets/", 2),
      r("ad_003", "Crash / Analytics Report", "app_developer",
        [D(["firebase.google.com", "crashlytics.com", "mixpanel.com", "amplitude.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Analytics/", 3),
      r("ad_004", "SDK / Framework", "app_developer",
        [F(["sdk", "framework", "library"]), E([".framework", ".xcframework", ".aar"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "SDKs/", 4),
    ]
  },

  lab_tech: {
    label: "Lab Technician", emoji: "🧬",
    description: "Sample reports, calibration records, SOPs, safety data sheets",
    category: "professional",
    rules: [
      r("lt_001", "Sample / Test Report", "lab_tech",
        [F(["sample report", "test results", "analysis", "assay"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Reports/", 1),
      r("lt_002", "SDS / Safety Sheet", "lab_tech",
        [F(["sds", "msds", "safety data sheet", "material safety"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Safety/SDS/", 2),
      r("lt_003", "SOP / Protocol", "lab_tech",
        [F(["sop", "protocol", "procedure", "method"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "SOPs/", 3),
      r("lt_004", "Calibration Record", "lab_tech",
        [F(["calibration", "maintenance log", "equipment log"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Equipment/Calibration/", 4),
    ]
  },

  cad_drafter: {
    label: "CAD / Drafter", emoji: "📐",
    description: "DWG files, revision histories, RFIs, as-built drawings",
    category: "professional",
    rules: [
      r("cd_001", "CAD Drawing", "cad_drafter",
        [E([".dwg", ".dxf", ".dwf", ".dws"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Drawings/", 1),
      r("cd_002", "PDF Plot / Print", "cad_drafter",
        [F(["plot", "print set", "drawing set", "as-built", "asbuilt"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Drawings/PDF/", 2),
      r("cd_003", "BIM / Revit File", "cad_drafter",
        [E([".rvt", ".rfa", ".ifc", ".nwd", ".nwc"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "BIM/", 3),
      r("cd_004", "Revision / Transmittal", "cad_drafter",
        [F(["rev_", "revision", "transmittal"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Transmittals/", 4),
    ]
  },

  landscaper: {
    label: "Landscaper / Contractor", emoji: "🧑‍🌾",
    description: "Project quotes, material orders, before/after photos, permits",
    category: "professional",
    rules: [
      r("lc_001", "Project Quote", "landscaper",
        [F(["quote", "estimate", "proposal", "bid"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/Quotes/", 1),
      r("lc_002", "Material Order", "landscaper",
        [F(["order", "purchase order", "materials", "supply"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/Orders/", 2),
      r("lc_003", "Permit", "landscaper",
        [F(["permit", "variance", "approval"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Permits/", 3),
      r("lc_004", "Client Contract", "landscaper",
        [F(["contract", "agreement", "scope of work"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 4),
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // PERSONAL
  // ════════════════════════════════════════════════════════════════════════════

  student: {
    label: "Student", emoji: "🎓",
    description: "Lectures, assignments, research papers, syllabi",
    category: "personal",
    rules: [
      r("stu_001", "Lecture Slides", "student",
        [E([".pptx", ".ppt"]), F(["lecture", "slides", "week", "module", "chapter"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Studies/Slides/", 1),
      r("stu_002", "Assignment", "student",
        [F(["assignment", "homework", "hw_", "task"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Studies/Assignments/", 2),
      r("stu_003", "Syllabus", "student",
        [F(["syllabus", "course outline", "curriculum"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Studies/Syllabi/", 3),
      r("stu_004", "Research Paper", "student",
        [D(["arxiv.org", "scholar.google.com", "researchgate.net", "jstor.org", "pubmed.ncbi.nlm.nih.gov"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Studies/Research/", 4),
    ]
  },

  personal_health: {
    label: "Personal Health", emoji: "💊",
    description: "Medical records, insurance EOBs, prescriptions, test results",
    category: "personal",
    rules: [
      r("ph_001", "Lab / Test Results", "personal_health",
        [F(["lab results", "test results", "bloodwork", "pathology"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Health/Labs/", 1),
      r("ph_002", "Insurance EOB", "personal_health",
        [F(["eob", "explanation of benefits", "insurance", "claim summary"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Health/Insurance/", 2),
      r("ph_003", "Medical Record", "personal_health",
        [F(["medical record", "visit summary", "discharge", "after visit"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Health/Records/", 3),
      r("ph_004", "Prescription", "personal_health",
        [F(["prescription", "rx", "medication"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Health/Prescriptions/", 4),
    ]
  },

  homeowner: {
    label: "Homeowner", emoji: "🏠",
    description: "Mortgage docs, HOA notices, repair quotes, warranties",
    category: "personal",
    rules: [
      r("ho_001", "Mortgage Document", "homeowner",
        [F(["mortgage", "closing disclosure", "loan", "deed", "title"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Home/Mortgage/", 1),
      r("ho_002", "HOA Notice", "homeowner",
        [F(["hoa", "homeowners association", "dues", "violation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Home/HOA/", 2),
      r("ho_003", "Repair / Contractor Quote", "homeowner",
        [F(["quote", "estimate", "repair", "contractor"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Home/Repairs/", 3),
      r("ho_004", "Appliance Warranty", "homeowner",
        [F(["warranty", "manual", "registration"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Home/Warranties/", 4),
    ]
  },

  car_owner: {
    label: "Car Owner", emoji: "🚗",
    description: "Registration, insurance, service records, financing",
    category: "personal",
    rules: [
      r("co_001", "Registration / Title", "car_owner",
        [F(["registration", "title", "dmv"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Car/Registration/", 1),
      r("co_002", "Insurance", "car_owner",
        [F(["insurance", "policy", "proof of insurance", "pink slip"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Car/Insurance/", 2),
      r("co_003", "Service Record", "car_owner",
        [F(["service", "oil change", "maintenance", "repair"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Car/Service/", 3),
      r("co_004", "Financing / Lease", "car_owner",
        [F(["loan", "lease", "financing", "payment schedule"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Car/Financing/", 4),
    ]
  },

  traveler: {
    label: "Traveler", emoji: "🌍",
    description: "Boarding passes, hotel confirmations, visa docs, itineraries",
    category: "personal",
    rules: [
      r("tv_001", "Flight Booking", "traveler",
        [D(["google.com/flights", "kayak.com", "expedia.com", "united.com", "delta.com", "aa.com", "southwest.com"]),
         F(["boarding pass", "itinerary", "e-ticket"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Travel/Flights/", 1),
      r("tv_002", "Hotel Confirmation", "traveler",
        [D(["booking.com", "hotels.com", "airbnb.com", "marriott.com", "hilton.com"]),
         F(["reservation", "confirmation", "hotel"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Travel/Hotels/", 2),
      r("tv_003", "Visa / Travel Document", "traveler",
        [F(["visa", "passport", "esta", "evisa", "travel authorization"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Travel/Visas/", 3),
      r("tv_004", "Travel Insurance", "traveler",
        [F(["travel insurance", "policy", "coverage"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Travel/Insurance/", 4),
    ]
  },

  wedding: {
    label: "Wedding Planning", emoji: "💍",
    description: "Vendor contracts, inspiration, guest lists, invoices",
    category: "personal",
    rules: [
      r("wd_001", "Vendor Contract", "wedding",
        [F(["venue", "caterer", "photographer", "florist", "dj", "band", "contract"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Wedding/Contracts/", 1),
      r("wd_002", "Guest List", "wedding",
        [F(["guest list", "rsvp", "seating"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Wedding/Guests/", 2),
      r("wd_003", "Inspiration / Mood Board", "wedding",
        [D(["pinterest.com", "theknot.com", "zola.com", "weddingwire.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Wedding/Inspiration/", 3),
      r("wd_004", "Invoice / Payment", "wedding",
        [F(["invoice", "deposit", "balance due", "payment"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Wedding/Finance/", 4),
    ]
  },

  finance: {
    label: "Finance & Accounting", emoji: "💰",
    description: "Receipts, bank statements, tax docs, payroll",
    category: "personal",
    rules: [
      r("fin_001", "Payment Receipt", "finance",
        [D(["stripe.com", "paypal.com", "square.com", "braintree.com"])], "ANY",
        "Receipt_[domain]_[YYYY-MM-DD]", "Finance/Receipts/[YYYY-MM]/", 1),
      r("fin_002", "Bank Statement", "finance",
        [F(["statement", "estatement", "bank_"])], "ANY",
        "Statement_[domain]_[YYYY-MM-DD]", "Finance/Statements/", 2),
      r("fin_003", "Tax Document", "finance",
        [F(["tax", "t4", "t1", "w2", "w-2", "1099", "roe"])], "ANY",
        "Tax_[page_title]_[YYYY]", "Finance/Tax/[YYYY]/", 3),
      r("fin_004", "Payroll", "finance",
        [F(["payroll", "paystub", "pay_stub", "payslip"])], "ANY",
        "Payroll_[YYYY-MM-DD]", "Finance/Payroll/", 4),
    ]
  },

  shopper: {
    label: "Online Shopper", emoji: "🛍️",
    description: "Order confirmations, receipts, returns",
    category: "personal",
    rules: [
      r("shop_001", "Order Confirmation", "shopper",
        [F(["order", "confirmation", "receipt"]),
         D(["amazon.com", "amazon.ca", "ebay.com", "etsy.com"])], "ANY",
        "Order_[domain]_[YYYY-MM-DD]", "Shopping/Orders/", 1),
      r("shop_002", "Return Label", "shopper",
        [F(["return", "refund", "label"])], "ANY",
        "Return_[domain]_[YYYY-MM-DD]", "Shopping/Returns/", 2),
    ]
  },

  moving: {
    label: "Moving / Relocation", emoji: "📦",
    description: "Moving quotes, lease, utility setups, change of address",
    category: "personal",
    rules: [
      r("mv_001", "Moving Quote", "moving",
        [F(["moving quote", "moving estimate", "relocation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Moving/Quotes/", 1),
      r("mv_002", "Lease / Rental Agreement", "moving",
        [F(["lease", "rental agreement", "tenancy"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Moving/Lease/", 2),
      r("mv_003", "Utility Setup", "moving",
        [F(["utility", "electric", "gas", "water", "internet", "setup"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Moving/Utilities/", 3),
      r("mv_004", "Change of Address", "moving",
        [F(["change of address", "forwarding", "usps"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Moving/Admin/", 4),
    ]
  },

  new_parent: {
    label: "New Parent", emoji: "👶",
    description: "Birth certificate, pediatric records, school enrollment, insurance",
    category: "personal",
    rules: [
      r("np_001", "Birth Certificate", "new_parent",
        [F(["birth certificate", "birth record"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Family/Documents/", 1),
      r("np_002", "Pediatric Records", "new_parent",
        [F(["pediatric", "well visit", "vaccination", "immunization", "growth chart"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Family/Health/", 2),
      r("np_003", "School Enrollment", "new_parent",
        [F(["enrollment", "registration", "school form", "daycare"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Family/School/", 3),
      r("np_004", "Child Insurance", "new_parent",
        [F(["insurance", "coverage", "dependent"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Family/Insurance/", 4),
    ]
  },

  fitness: {
    label: "Fitness Enthusiast", emoji: "🏋️",
    description: "Workout plans, nutrition guides, progress tracking, wearable exports",
    category: "personal",
    rules: [
      r("fit_001", "Workout Plan", "fitness",
        [F(["workout", "training plan", "program", "routine"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Fitness/Plans/", 1),
      r("fit_002", "Nutrition Guide", "fitness",
        [F(["nutrition", "meal plan", "diet", "macros", "calories"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Fitness/Nutrition/", 2),
      r("fit_003", "Wearable / App Export", "fitness",
        [D(["connect.garmin.com", "strava.com", "fitbit.com", "apple.com", "myfitnesspal.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Fitness/Data/", 3),
    ]
  },

  pet_owner: {
    label: "Pet Owner", emoji: "🐾",
    description: "Vet records, vaccination docs, insurance, food orders",
    category: "personal",
    rules: [
      r("pet_001", "Vet Record", "pet_owner",
        [F(["vet", "veterinary", "clinic", "visit summary"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Pets/VetRecords/", 1),
      r("pet_002", "Vaccination / Health Cert", "pet_owner",
        [F(["vaccination", "rabies", "health certificate", "titer"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Pets/Vaccines/", 2),
      r("pet_003", "Pet Insurance", "pet_owner",
        [F(["pet insurance", "claim", "reimbursement"]),
         D(["trupanion.com", "petplan.com", "healthy paws"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Pets/Insurance/", 3),
      r("pet_004", "Food / Supplies Order", "pet_owner",
        [D(["chewy.com", "petco.com", "petsmart.com"])], "ANY",
        "PetOrder_[domain]_[YYYY-MM-DD]", "Pets/Orders/", 4),
    ]
  },

  job_seeker: {
    label: "Job Seeker", emoji: "💼",
    description: "Resumes, cover letters, offer letters, interview notes",
    category: "personal",
    rules: [
      r("js_001", "Resume / CV", "job_seeker",
        [F(["resume", "cv", "curriculum vitae"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Job Search/Resume/", 1),
      r("js_002", "Cover Letter", "job_seeker",
        [F(["cover letter", "application letter"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Job Search/Cover Letters/", 2),
      r("js_003", "Job Description", "job_seeker",
        [D(["linkedin.com", "indeed.com", "greenhouse.io", "lever.co", "workday.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Job Search/Postings/", 3),
      r("js_004", "Offer Letter", "job_seeker",
        [F(["offer letter", "offer of employment", "compensation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Job Search/Offers/", 4),
    ]
  },

  immigration: {
    label: "Immigration / Visa", emoji: "🧑‍⚖️",
    description: "Passport scans, visa applications, I-20s, embassy letters",
    category: "personal",
    rules: [
      r("im_001", "Visa Application", "immigration",
        [F(["visa", "ds-160", "application form", "visa form"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Immigration/Visa/", 1),
      r("im_002", "I-20 / Admission Letter", "immigration",
        [F(["i-20", "i20", "admission letter", "acceptance letter", "sevis"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Immigration/Admission/", 2),
      r("im_003", "Work Authorization", "immigration",
        [F(["ead", "work permit", "i-140", "i-485", "green card", "h1b"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Immigration/Work Auth/", 3),
      r("im_004", "Embassy / USCIS Letter", "immigration",
        [F(["uscis", "embassy", "consulate", "notice of action", "receipt notice"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Immigration/Letters/", 4),
    ]
  },

  homeschool: {
    label: "Homeschool Parent", emoji: "🎓",
    description: "Curriculum plans, assessment records, co-op schedules, transcripts",
    category: "personal",
    rules: [
      r("hs_001", "Curriculum Plan", "homeschool",
        [F(["curriculum", "lesson plan", "unit study", "scope and sequence"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Homeschool/Curriculum/", 1),
      r("hs_002", "Assessment / Test", "homeschool",
        [F(["assessment", "test", "evaluation", "sat", "act", "standardized"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Homeschool/Assessments/", 2),
      r("hs_003", "Transcript", "homeschool",
        [F(["transcript", "report card", "grades"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Homeschool/Records/", 3),
      r("hs_004", "Co-op / Activity Schedule", "homeschool",
        [F(["co-op", "coop", "schedule", "activity", "field trip"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Homeschool/Schedule/", 4),
    ]
  },

  phd_student: {
    label: "PhD / Grad Student", emoji: "🎓",
    description: "Dissertation drafts, advisor feedback, conference papers, funding",
    category: "personal",
    rules: [
      r("phd_001", "Dissertation / Thesis", "phd_student",
        [F(["dissertation", "thesis", "chapter", "draft"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Dissertation/", 1),
      r("phd_002", "Advisor Feedback", "phd_student",
        [F(["feedback", "comments", "revision", "tracked changes"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Dissertation/Feedback/", 2),
      r("phd_003", "Conference / Journal Paper", "phd_student",
        [D(["arxiv.org", "acm.org", "ieeexplore.ieee.org", "springer.com", "elsevier.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/Papers/", 3),
      r("phd_004", "Fellowship / Funding", "phd_student",
        [F(["fellowship", "stipend", "funding", "grant", "nsf", "nih"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Research/Funding/", 4),
    ]
  },

  property_manager: {
    label: "Property Manager", emoji: "🏢",
    description: "Tenant leases, maintenance requests, rent receipts, inspections",
    category: "personal",
    rules: [
      r("pm_001", "Tenant Lease", "property_manager",
        [F(["lease", "rental agreement", "tenancy agreement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Properties/Leases/", 1),
      r("pm_002", "Maintenance Request", "property_manager",
        [F(["maintenance", "repair request", "work order"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Properties/Maintenance/", 2),
      r("pm_003", "Rent Receipt", "property_manager",
        [F(["rent receipt", "payment receipt", "rent roll"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Properties/Rent/", 3),
      r("pm_004", "Property Inspection", "property_manager",
        [F(["inspection", "move-in", "move-out", "property condition"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Properties/Inspections/", 4),
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // INDUSTRY
  // ════════════════════════════════════════════════════════════════════════════

  medical_practice: {
    label: "Medical Practice", emoji: "🏥",
    description: "Patient forms, billing, insurance claims, HIPAA compliance",
    category: "industry",
    rules: [
      r("mp_001", "Patient Intake Form", "medical_practice",
        [F(["intake", "patient form", "registration", "new patient"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Patients/Intake/", 1),
      r("mp_002", "Insurance Claim", "medical_practice",
        [F(["claim", "cms-1500", "ub-04", "superbill", "era", "eob"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Billing/Claims/", 2),
      r("mp_003", "HIPAA / Compliance", "medical_practice",
        [F(["hipaa", "baa", "compliance", "privacy notice", "authorization"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/HIPAA/", 3),
      r("mp_004", "EHR Export", "medical_practice",
        [D(["epic.com", "athenahealth.com", "eclinicalworks.com", "drchrono.com", "practicefusion.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "EHR/Exports/", 4),
    ]
  },

  school_admin: {
    label: "School / University Admin", emoji: "🏫",
    description: "Enrollment docs, transcripts, faculty contracts, financial aid",
    category: "industry",
    rules: [
      r("sa_001", "Enrollment Document", "school_admin",
        [F(["enrollment", "registration", "admission"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Admin/Enrollment/", 1),
      r("sa_002", "Transcript", "school_admin",
        [F(["transcript", "academic record", "grades"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Admin/Transcripts/", 2),
      r("sa_003", "Faculty Contract", "school_admin",
        [F(["faculty", "staff contract", "employment agreement", "offer letter"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "HR/Contracts/", 3),
      r("sa_004", "Financial Aid", "school_admin",
        [F(["financial aid", "fafsa", "scholarship", "grant award"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Financial Aid/", 4),
    ]
  },

  nonprofit: {
    label: "Nonprofit", emoji: "🏛️",
    description: "Grant docs, donation receipts, board minutes, IRS filings",
    category: "industry",
    rules: [
      r("np2_001", "Grant Application", "nonprofit",
        [F(["grant", "application", "proposal", "rfp"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Grants/Applications/", 1),
      r("np2_002", "Donation Receipt", "nonprofit",
        [F(["donation", "receipt", "acknowledgment", "tax receipt"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Donations/", 2),
      r("np2_003", "Board Minutes", "nonprofit",
        [F(["board minutes", "meeting minutes", "resolution", "agenda"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Governance/Minutes/", 3),
      r("np2_004", "IRS / 990 Filing", "nonprofit",
        [F(["990", "irs", "form 1023", "tax exempt", "nonprofit filing"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/IRS/", 4),
    ]
  },

  manufacturing: {
    label: "Manufacturing", emoji: "🏭",
    description: "QC reports, safety docs, equipment manuals, supplier POs",
    category: "industry",
    rules: [
      r("mfg_001", "QC / Quality Report", "manufacturing",
        [F(["quality", "qc", "inspection report", "ncr", "defect"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Quality/Reports/", 1),
      r("mfg_002", "Safety Document", "manufacturing",
        [F(["safety", "msds", "sds", "lockout tagout", "osha"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Safety/", 2),
      r("mfg_003", "Equipment Manual", "manufacturing",
        [F(["manual", "user guide", "operation manual", "maintenance manual"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Equipment/Manuals/", 3),
      r("mfg_004", "Supplier PO", "manufacturing",
        [F(["purchase order", "po_", "supplier", "vendor"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Procurement/POs/", 4),
    ]
  },

  agriculture: {
    label: "Agriculture / Farming", emoji: "🌱",
    description: "Crop reports, equipment invoices, compliance docs, subsidies",
    category: "industry",
    rules: [
      r("ag_001", "Crop / Harvest Report", "agriculture",
        [F(["crop report", "harvest", "yield", "field report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Farming/Reports/", 1),
      r("ag_002", "Equipment Invoice", "agriculture",
        [F(["equipment", "tractor", "implement", "invoice"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Equipment/", 2),
      r("ag_003", "Compliance / Certification", "agriculture",
        [F(["organic", "gmo", "usda", "fda", "pesticide", "certification"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 3),
      r("ag_004", "Subsidy / Grant", "agriculture",
        [F(["subsidy", "grant", "usda payment", "fsa"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Subsidies/", 4),
    ]
  },

  energy: {
    label: "Energy / Utilities", emoji: "⚡",
    description: "Meter data exports, compliance reports, contractor invoices",
    category: "industry",
    rules: [
      r("en_001", "Meter / Usage Data", "energy",
        [F(["meter data", "usage report", "interval data", "smart meter"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Operations/Meter Data/", 1),
      r("en_002", "Compliance Report", "energy",
        [F(["compliance", "ferc", "nerc", "epa", "emissions"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/", 2),
      r("en_003", "Contractor Invoice", "energy",
        [F(["invoice", "contractor", "maintenance", "field service"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 3),
      r("en_004", "Utility Bill", "energy",
        [F(["utility bill", "electric bill", "gas bill", "water bill"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Utility Bills/", 4),
    ]
  },

  construction: {
    label: "Construction", emoji: "🏗️",
    description: "Permits, contracts, change orders, inspection reports",
    category: "industry",
    rules: [
      r("con2_001", "Building Permit", "construction",
        [F(["permit", "building permit", "certificate of occupancy"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/Permits/", 1),
      r("con2_002", "Subcontractor Contract", "construction",
        [F(["subcontract", "contract", "agreement", "scope of work"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/Contracts/", 2),
      r("con2_003", "Change Order", "construction",
        [F(["change order", "co_", "variation order", "oco"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/Change Orders/", 3),
      r("con2_004", "Daily Report / Log", "construction",
        [F(["daily report", "site log", "field report", "progress report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Project/Daily Reports/", 4),
    ]
  },

  banking_fintech: {
    label: "Banking / FinTech", emoji: "🏦",
    description: "Compliance docs, KYC files, audit reports, regulatory filings",
    category: "industry",
    rules: [
      r("bf_001", "KYC / AML Document", "banking_fintech",
        [F(["kyc", "aml", "customer due diligence", "cdd", "identity verification"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/KYC/", 1),
      r("bf_002", "Regulatory Filing", "banking_fintech",
        [F(["sec filing", "fdic", "cfpb", "finra", "regulatory"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/Regulatory/", 2),
      r("bf_003", "Audit Report", "banking_fintech",
        [F(["audit", "exam report", "findings", "sox"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Compliance/Audits/", 3),
      r("bf_004", "Transaction Export", "banking_fintech",
        [D(["plaid.com", "yodlee.com", "mx.com"]), F(["transaction", "ledger", "reconciliation"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Transactions/", 4),
    ]
  },

  insurance: {
    label: "Insurance Agent", emoji: "🛡️",
    description: "Policies, claims, client intake, underwriting docs",
    category: "industry",
    rules: [
      r("ins_001", "Policy Document", "insurance",
        [F(["policy", "declaration page", "dec page", "certificate of insurance", "coi"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Policies/", 1),
      r("ins_002", "Claim Document", "insurance",
        [F(["claim", "loss run", "proof of loss", "adjuster"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Claims/", 2),
      r("ins_003", "Underwriting / Application", "insurance",
        [F(["application", "underwriting", "quote", "submission"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Underwriting/", 3),
      r("ins_004", "Client Intake", "insurance",
        [F(["intake", "new client", "onboarding", "acord"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Intake/", 4),
    ]
  },

  biotech: {
    label: "Biotech / Pharma", emoji: "🧬",
    description: "Clinical trial docs, FDA submissions, lab reports, patents",
    category: "industry",
    rules: [
      r("bt_001", "Clinical Trial Document", "biotech",
        [F(["clinical trial", "protocol", "crf", "icf", "informed consent"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clinical/", 1),
      r("bt_002", "FDA Submission", "biotech",
        [F(["fda", "ind", "nda", "bla", "510k", "510(k)"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Regulatory/FDA/", 2),
      r("bt_003", "Lab / Assay Report", "biotech",
        [F(["lab report", "assay", "bioassay", "pcr", "sequencing"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Lab/Reports/", 3),
      r("bt_004", "Patent / IP", "biotech",
        [F(["patent", "ip", "intellectual property", "provisional"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Legal/Patents/", 4),
    ]
  },

  retail_ecommerce: {
    label: "Retail / E-commerce", emoji: "🏪",
    description: "Inventory exports, supplier invoices, returns, ad spend",
    category: "industry",
    rules: [
      r("re2_001", "Inventory Export", "retail_ecommerce",
        [D(["shopify.com", "woocommerce.com", "bigcommerce.com"]),
         F(["inventory", "stock", "sku"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Inventory/", 1),
      r("re2_002", "Supplier Invoice", "retail_ecommerce",
        [F(["supplier", "wholesale", "vendor invoice", "po"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Suppliers/", 2),
      r("re2_003", "Return & Refund Report", "retail_ecommerce",
        [F(["return", "refund", "chargeback", "dispute"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Operations/Returns/", 3),
      r("re2_004", "Ad Spend Report", "retail_ecommerce",
        [D(["ads.google.com", "facebook.com/ads", "ads.tiktok.com", "amazon.com/advertising"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Marketing/Ad Spend/", 4),
    ]
  },

  hoa: {
    label: "HOA Manager", emoji: "🏘️",
    description: "Meeting minutes, violation notices, vendor bids, financials",
    category: "industry",
    rules: [
      r("hoa_001", "Meeting Minutes", "hoa",
        [F(["minutes", "meeting minutes", "board meeting", "annual meeting"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Governance/Minutes/", 1),
      r("hoa_002", "Violation Notice", "hoa",
        [F(["violation", "notice", "warning", "fine"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Violations/", 2),
      r("hoa_003", "Vendor Bid / Contract", "hoa",
        [F(["bid", "quote", "vendor", "contract", "landscaping", "pool"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Vendors/", 3),
      r("hoa_004", "Financial Statement", "hoa",
        [F(["budget", "financial statement", "reserve study", "dues"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/", 4),
    ]
  },

  event_planner: {
    label: "Event Planner", emoji: "🎪",
    description: "Vendor contracts, venue agreements, run-of-show, guest lists",
    category: "industry",
    rules: [
      r("ep_001", "Venue Agreement", "event_planner",
        [F(["venue", "venue contract", "facility agreement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Events/Venue/", 1),
      r("ep_002", "Vendor Contract", "event_planner",
        [F(["vendor", "catering", "av", "florist", "entertainment", "contract"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Events/Vendors/", 2),
      r("ep_003", "Run of Show / Timeline", "event_planner",
        [F(["run of show", "timeline", "schedule", "program"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Events/RunOfShow/", 3),
      r("ep_004", "Guest List / RSVP", "event_planner",
        [F(["guest list", "rsvp", "attendee list", "registration"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Events/Guests/", 4),
    ]
  },

  first_responder: {
    label: "First Responder", emoji: "🚔",
    description: "Incident reports, training certs, equipment logs, compliance",
    category: "industry",
    rules: [
      r("fr_001", "Incident Report", "first_responder",
        [F(["incident report", "police report", "fire report", "ems report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Reports/Incidents/", 1),
      r("fr_002", "Training Certificate", "first_responder",
        [F(["certification", "training", "cpr", "first aid", "acls", "nims"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Training/Certs/", 2),
      r("fr_003", "Equipment Log", "first_responder",
        [F(["equipment", "apparatus", "maintenance log", "inspection"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Equipment/Logs/", 3),
      r("fr_004", "Policy / SOP", "first_responder",
        [F(["policy", "sop", "procedure", "directive", "general order"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Policies/", 4),
    ]
  },

  amazon_fba: {
    label: "Amazon / FBA Seller", emoji: "📦",
    description: "Inventory reports, reimbursements, PPC exports, supplier invoices",
    category: "industry",
    rules: [
      r("amz_001", "FBA Inventory Report", "amazon_fba",
        [D(["sellercentral.amazon.com"]), F(["inventory", "fba", "stranded"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Amazon/Inventory/", 1),
      r("amz_002", "Reimbursement Report", "amazon_fba",
        [F(["reimbursement", "reconciliation", "lost", "damaged"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Amazon/Reimbursements/", 2),
      r("amz_003", "PPC / Advertising Report", "amazon_fba",
        [F(["sponsored", "advertising", "ppc", "acos", "campaign"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Amazon/Advertising/", 3),
      r("amz_004", "Supplier Invoice", "amazon_fba",
        [F(["supplier", "factory", "alibaba", "invoice", "proforma"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Suppliers/", 4),
    ]
  },

  sports_athlete: {
    label: "Sports Athlete", emoji: "🏄",
    description: "Contracts, medical clearances, performance reports, sponsorships",
    category: "industry",
    rules: [
      r("sp_001", "Player Contract", "sports_athlete",
        [F(["contract", "player agreement", "standard player contract"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 1),
      r("sp_002", "Medical Clearance", "sports_athlete",
        [F(["medical clearance", "physical", "medical exam", "clearance form"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Medical/", 2),
      r("sp_003", "Performance Report", "sports_athlete",
        [F(["performance", "stats", "analytics", "scouting report"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Performance/", 3),
      r("sp_004", "Sponsorship / Endorsement", "sports_athlete",
        [F(["sponsorship", "endorsement", "partnership", "brand deal"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Sponsorships/", 4),
    ]
  },

  actor: {
    label: "Actor / Performer", emoji: "🎭",
    description: "Headshots, scripts, audition sides, agent contracts",
    category: "industry",
    rules: [
      r("act_001", "Script / Sides", "actor",
        [F(["script", "sides", "dialogue", "screenplay"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/Scripts/", 1),
      r("act_002", "Audition Material", "actor",
        [F(["audition", "self-tape", "callback"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Auditions/", 2),
      r("act_003", "Contract / Deal Memo", "actor",
        [F(["contract", "deal memo", "booking confirmation", "rider"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Contracts/", 3),
      r("act_004", "Agent / Casting Platform", "actor",
        [D(["actors access", "casting frontier", "breakdown services", "castingnetworks.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Casting/", 4),
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // HOBBY
  // ════════════════════════════════════════════════════════════════════════════

  professional: {
    label: "General Professional", emoji: "🖥️",
    description: "Reports, presentations, spreadsheets, archives",
    category: "hobby",
    rules: [
      r("pro_001", "Presentations", "professional",
        [E([".pptx", ".ppt", ".key"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Presentations/", 1),
      r("pro_002", "Spreadsheets", "professional",
        [E([".xlsx", ".xls", ".csv"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Spreadsheets/", 2),
      r("pro_003", "Archives", "professional",
        [E([".zip", ".rar", ".tar", ".gz"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Archives/", 3),
    ]
  },

  game_dev: {
    label: "Game Developer", emoji: "🎮",
    description: "Build exports, asset packs, design docs, playtesting notes",
    category: "hobby",
    rules: [
      r("gd_001", "Game Build", "game_dev",
        [E([".exe", ".apk", ".ipa", ".pkg", ".dmg"]), F(["build", "release", "alpha", "beta"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Builds/", 1),
      r("gd_002", "Asset Pack", "game_dev",
        [D(["assetstore.unity.com", "fab.com", "itch.io", "kenney.nl"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Assets/", 2),
      r("gd_003", "Design Document", "game_dev",
        [F(["gdd", "game design document", "design doc", "spec"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/", 3),
      r("gd_004", "Playtesting Notes", "game_dev",
        [F(["playtest", "feedback", "notes", "session"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Playtesting/", 4),
    ]
  },

  writer: {
    label: "Writer / Author", emoji: "✍️",
    description: "Manuscript drafts, editing notes, publisher contracts, research",
    category: "hobby",
    rules: [
      r("wr_001", "Manuscript / Draft", "writer",
        [F(["manuscript", "draft", "chapter", "novel", "story"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Writing/Manuscripts/", 1),
      r("wr_002", "Editorial Notes", "writer",
        [F(["editorial", "editor notes", "feedback", "revision", "tracked"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Writing/Edits/", 2),
      r("wr_003", "Publisher Contract", "writer",
        [F(["publishing contract", "book deal", "advance", "royalties", "agent"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Contracts/", 3),
      r("wr_004", "Research Material", "writer",
        [F(["research", "notes", "source material", "reference"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Writing/Research/", 4),
    ]
  },

  musician: {
    label: "Musician", emoji: "🎵",
    description: "Stem files, licensing agreements, setlists, royalty statements",
    category: "hobby",
    rules: [
      r("mus_001", "Stem / Project File", "musician",
        [E([".als", ".logic", ".ptx", ".flp", ".wav", ".aif"]), F(["stem", "session", "project"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Music/Projects/", 1),
      r("mus_002", "Sync / Licensing Agreement", "musician",
        [F(["sync license", "master license", "publishing", "licensing agreement"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Licenses/", 2),
      r("mus_003", "Royalty Statement", "musician",
        [D(["distrokid.com", "tunecore.com", "cdbaby.com", "soundexchange.com", "ascap.com", "bmi.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Royalties/", 3),
      r("mus_004", "Setlist / Production Rider", "musician",
        [F(["setlist", "rider", "hospitality", "technical rider"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shows/", 4),
    ]
  },

  videographer: {
    label: "Videographer", emoji: "📷",
    description: "Project files, client briefs, delivery receipts, stock footage",
    category: "hobby",
    rules: [
      r("vid_001", "Project / Sequence File", "videographer",
        [E([".prproj", ".aep", ".drp", ".fcpbundle"]), F(["project", "sequence"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Projects/", 1),
      r("vid_002", "Client Brief", "videographer",
        [F(["brief", "creative brief", "shot list", "storyboard"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Briefs/", 2),
      r("vid_003", "Stock Footage", "videographer",
        [D(["videoblocks.com", "storyblocks.com", "artgrid.io", "pond5.com", "shutterstock.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Assets/Stock/", 3),
      r("vid_004", "Delivery Receipt / Invoice", "videographer",
        [F(["delivery", "invoice", "final delivery", "handoff"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 4),
    ]
  },

  printing_3d: {
    label: "3D Printing", emoji: "🖨️",
    description: "STL/OBJ files, print settings, filament orders, model licenses",
    category: "hobby",
    rules: [
      r("3d_001", "3D Model File", "printing_3d",
        [E([".stl", ".obj", ".3mf", ".amf", ".ply"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "3D Models/", 1),
      r("3d_002", "Slicer / Print Settings", "printing_3d",
        [E([".gcode", ".3mf"]), F(["slicer", "print settings", "profile"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "3D Models/Sliced/", 2),
      r("3d_003", "Model from Marketplace", "printing_3d",
        [D(["thingiverse.com", "printables.com", "myminifactory.com", "cults3d.com", "thangs.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "3D Models/Downloaded/", 3),
      r("3d_004", "Filament / Supply Order", "printing_3d",
        [D(["prusament.com", "hatchbox3d.com", "polymaker.io"]), F(["filament", "resin", "order"])], "ANY",
        "Order_[domain]_[YYYY-MM-DD]", "3D Models/Supplies/", 4),
    ]
  },

  food_blogger: {
    label: "Food Blogger", emoji: "🍳",
    description: "Recipe drafts, brand deals, photo exports, analytics",
    category: "hobby",
    rules: [
      r("fb_001", "Recipe Draft", "food_blogger",
        [F(["recipe", "ingredients", "instructions"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Blog/Recipes/", 1),
      r("fb_002", "Brand / Sponsorship Deal", "food_blogger",
        [F(["brand deal", "sponsorship", "partnership", "collaboration brief"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Deals/", 2),
      r("fb_003", "Photography Export", "food_blogger",
        [E([".raw", ".cr2", ".nef", ".jpg", ".png"]), F(["food photo", "shoot"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Photos/", 3),
      r("fb_004", "Analytics Report", "food_blogger",
        [D(["analytics.google.com", "mediavine.com", "adthrive.com", "raptive.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Analytics/", 4),
    ]
  },

  crafter: {
    label: "Crafter / Etsy Seller", emoji: "🧵",
    description: "Patterns, order exports, shipping labels, supplier invoices",
    category: "hobby",
    rules: [
      r("cr_001", "Pattern / SVG / Design", "crafter",
        [E([".svg", ".pdf", ".dxf", ".png"]), F(["pattern", "template", "design", "cut file"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Crafts/Patterns/", 1),
      r("cr_002", "Etsy Order Export", "crafter",
        [D(["etsy.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Shop/Orders/", 2),
      r("cr_003", "Shipping Label", "crafter",
        [F(["shipping label", "postage", "packing slip"])], "ANY",
        "Label_[YYYY-MM-DD]", "Shop/Labels/", 3),
      r("cr_004", "Supplier Invoice", "crafter",
        [F(["supplier", "wholesale", "invoice", "materials"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Suppliers/", 4),
    ]
  },

  nft_artist: {
    label: "NFT / Digital Artist", emoji: "🧑‍🎨",
    description: "Mint confirmations, royalty statements, commission contracts, artwork",
    category: "hobby",
    rules: [
      r("nft_001", "Artwork File", "nft_artist",
        [E([".png", ".gif", ".mp4", ".glb", ".svg"]), F(["artwork", "collection", "edition"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Art/Originals/", 1),
      r("nft_002", "Mint / Transaction Confirmation", "nft_artist",
        [F(["mint", "transaction", "confirmation"]),
         D(["opensea.io", "foundation.app", "rarible.com", "blur.io"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "NFT/Mints/", 2),
      r("nft_003", "Royalty Statement", "nft_artist",
        [F(["royalty", "secondary sales", "earnings"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Royalties/", 3),
      r("nft_004", "Commission Contract", "nft_artist",
        [F(["commission", "contract", "agreement", "brief"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Contracts/", 4),
    ]
  },

  board_game: {
    label: "Board Game Designer", emoji: "♟️",
    description: "Rulebooks, playtesting feedback, art files, publisher submissions",
    category: "hobby",
    rules: [
      r("bg_001", "Rulebook / Ruleset", "board_game",
        [F(["rulebook", "rules", "ruleset", "law"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/Rulebooks/", 1),
      r("bg_002", "Playtesting Feedback", "board_game",
        [F(["playtest", "feedback", "session report", "notes"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/Playtesting/", 2),
      r("bg_003", "Print & Play / Art File", "board_game",
        [F(["pnp", "print and play", "card art", "board art", "component"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Design/Art/", 3),
      r("bg_004", "Publisher Submission", "board_game",
        [F(["submission", "pitch", "publisher", "sell sheet"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Business/Submissions/", 4),
    ]
  },

  chef: {
    label: "Private Chef / Caterer", emoji: "🧑‍🍳",
    description: "Menus, client contracts, ingredient orders, event invoices",
    category: "hobby",
    rules: [
      r("chf_001", "Menu / Recipe Pack", "chef",
        [F(["menu", "recipe", "tasting menu", "course"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Menus/", 1),
      r("chf_002", "Client Contract", "chef",
        [F(["contract", "agreement", "service agreement", "catering"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Clients/Contracts/", 2),
      r("chf_003", "Ingredient / Supply Order", "chef",
        [F(["order", "invoice", "supplier", "produce", "ingredients"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Orders/", 3),
      r("chf_004", "Event Invoice", "chef",
        [F(["invoice", "event", "quote", "estimate"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Finance/Invoices/", 4),
    ]
  },

  gardener: {
    label: "Gardener", emoji: "🪴",
    description: "Planting schedules, seed orders, harvest logs, garden plans",
    category: "hobby",
    rules: [
      r("gar_001", "Planting Schedule", "gardener",
        [F(["planting schedule", "sowing", "planting plan", "calendar"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Garden/Schedules/", 1),
      r("gar_002", "Seed / Plant Order", "gardener",
        [D(["johnnyseeds.com", "burpee.com", "rareseeds.com", "high mowing"]),
         F(["seed order", "plant order"])], "ANY",
        "Order_[domain]_[YYYY-MM-DD]", "Garden/Orders/", 2),
      r("gar_003", "Harvest Log", "gardener",
        [F(["harvest", "yield", "crop log"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Garden/Logs/", 3),
      r("gar_004", "Garden Plan / Design", "gardener",
        [F(["garden plan", "layout", "bed design"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Garden/Plans/", 4),
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // META
  // ════════════════════════════════════════════════════════════════════════════

  date_first: {
    label: "Date-First Everything", emoji: "📅",
    description: "Puts YYYY-MM-DD at the front of every filename, no exceptions",
    category: "meta",
    rules: [
      r("df_001", "Date-prefix all PDFs", "date_first",
        [E([".pdf"])], "ANY",
        "[YYYY-MM-DD]_[page_title]", "Downloads/", 1),
      r("df_002", "Date-prefix all Office docs", "date_first",
        [E([".docx", ".xlsx", ".pptx", ".doc", ".xls", ".ppt"])], "ANY",
        "[YYYY-MM-DD]_[page_title]", "Downloads/", 2),
      r("df_003", "Date-prefix all archives", "date_first",
        [E([".zip", ".rar", ".tar", ".gz"])], "ANY",
        "[YYYY-MM-DD]_[page_title]", "Downloads/", 3),
    ]
  },

  by_source: {
    label: "Organize by Source", emoji: "🗂️",
    description: "Routes every file into a folder named after its source domain",
    category: "meta",
    rules: [
      r("bs_001", "Google files", "by_source",
        [D(["google.com", "docs.google.com", "drive.google.com", "sheets.google.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Sources/Google/", 1),
      r("bs_002", "Dropbox files", "by_source",
        [D(["dropbox.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Sources/Dropbox/", 2),
      r("bs_003", "Notion files", "by_source",
        [D(["notion.so"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Sources/Notion/", 3),
      r("bs_004", "GitHub files", "by_source",
        [D(["github.com"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Sources/GitHub/", 4),
    ]
  },

  version_control: {
    label: "Version Control", emoji: "🔢",
    description: "Detects revision patterns and appends _v1, _v2 style suffixes",
    category: "meta",
    rules: [
      r("vc_001", "Add version suffix to documents", "version_control",
        [F(["v1", "v2", "v3", "version", "rev_", "revision", "draft"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Versioned/", 1),
      r("vc_002", "Version software releases", "version_control",
        [F(["release", "changelog", "patch notes"]), E([".zip", ".dmg", ".exe"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Releases/", 2),
    ]
  },

  cleanup_only: {
    label: "Cleanup Only", emoji: "🧹",
    description: "Strips hashes, timestamps, and (1)(2) suffixes — no folder routing",
    category: "meta",
    rules: [
      r("cl_001", "Clean all downloads in place", "cleanup_only",
        [E([".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".zip", ".png", ".jpg"])], "ANY",
        "[page_title]_[YYYY-MM-DD]", "Downloads/", 1),
    ]
  },

  language_locale: {
    label: "Language / Locale", emoji: "🌍",
    description: "Detects language codes in filenames and sorts into EN/, FR/, ES/ folders",
    category: "meta",
    rules: [
      r("ll_001", "English files", "language_locale",
        [F(["_en", "_en_", "-en-", "_eng", "english"])], "ANY",
        "[page_title]", "Locales/EN/", 1),
      r("ll_002", "French files", "language_locale",
        [F(["_fr", "_fr_", "-fr-", "_fra", "french", "français"])], "ANY",
        "[page_title]", "Locales/FR/", 2),
      r("ll_003", "Spanish files", "language_locale",
        [F(["_es", "_es_", "-es-", "_spa", "spanish", "español"])], "ANY",
        "[page_title]", "Locales/ES/", 3),
      r("ll_004", "German files", "language_locale",
        [F(["_de", "_de_", "-de-", "_deu", "german", "deutsch"])], "ANY",
        "[page_title]", "Locales/DE/", 4),
      r("ll_005", "Portuguese files", "language_locale",
        [F(["_pt", "_pt_", "-pt-", "_por", "portuguese", "português"])], "ANY",
        "[page_title]", "Locales/PT/", 5),
    ]
  },
}

// ── Helpers used by the rest of the app ──────────────────────────────────────

export function getRulesForPacks(packs: PersonaPack[]): Rule[] {
  return packs.flatMap((p) => PACKS[p]?.rules ?? [])
}

export const ALL_PACKS = Object.keys(PACKS) as PersonaPack[]

export const PACK_CATEGORIES: Record<
  PackCategory,
  { label: string; emoji: string; packs: PersonaPack[] }
> = {
  professional: {
    label: "Professional", emoji: "💼",
    packs: [
      "consultant", "legal", "healthcare_worker", "real_estate", "developer",
      "designer", "photographer", "marketing", "hr_recruiter", "architect_engineer",
      "procurement_ops", "pr_comms", "researcher", "accountant", "financial_advisor",
      "teacher", "content_creator", "personal_trainer", "restaurant", "logistics",
      "social_media", "executive", "freelance_writer", "translator", "it_admin",
      "cybersecurity", "app_developer", "lab_tech", "cad_drafter", "landscaper",
    ]
  },
  personal: {
    label: "Personal", emoji: "🏠",
    packs: [
      "student", "personal_health", "homeowner", "car_owner", "traveler",
      "wedding", "finance", "shopper", "moving", "new_parent",
      "fitness", "pet_owner", "job_seeker", "immigration", "homeschool",
      "phd_student", "property_manager",
    ]
  },
  industry: {
    label: "Industry", emoji: "🏭",
    packs: [
      "medical_practice", "school_admin", "nonprofit", "manufacturing", "agriculture",
      "energy", "construction", "banking_fintech", "insurance", "biotech",
      "retail_ecommerce", "hoa", "event_planner", "first_responder", "amazon_fba",
      "sports_athlete", "actor",
    ]
  },
  hobby: {
    label: "Hobby", emoji: "🎨",
    packs: [
      "professional", "game_dev", "writer", "musician", "videographer",
      "printing_3d", "food_blogger", "crafter", "nft_artist", "board_game",
      "chef", "gardener",
    ]
  },
  meta: {
    label: "Meta", emoji: "⚙️",
    packs: ["date_first", "by_source", "version_control", "cleanup_only", "language_locale"]
  },
}
