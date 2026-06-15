import { type PersonaPack, type Rule } from "../types"

interface PackDef {
  label: string
  emoji: string
  description: string
  rules: Rule[]
}

const now = () => new Date().toISOString()

export const PACKS: Record<PersonaPack, PackDef> = {
  consultant: {
    label: "Consultant & Freelancer",
    emoji: "💼",
    description: "Invoices, contracts, proposals, client deliverables",
    rules: [
      {
        id: "con_001",
        name: "Invoice Detection",
        pack: "consultant",
        active: true,
        priority: 1,
        is_custom: false,
        conditions: [
          { type: "filename_contains", values: ["invoice", "inv_", "bill"] },
          { type: "url_contains", values: ["invoice", "billing"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Finance/Invoices/"
        },
        created_at: now()
      },
      {
        id: "con_002",
        name: "Contract Detection",
        pack: "consultant",
        active: true,
        priority: 2,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["contract", "agreement", "sow", "nda", "msa"]
          },
          {
            type: "source_domain",
            values: ["docusign.net", "hellosign.com", "pandadoc.com"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Contracts/"
        },
        created_at: now()
      },
      {
        id: "con_003",
        name: "Proposal Detection",
        pack: "consultant",
        active: true,
        priority: 3,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["proposal", "quote", "rfp", "rfq"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Proposals/"
        },
        created_at: now()
      },
      {
        id: "con_004",
        name: "Salesforce Export",
        pack: "consultant",
        active: true,
        priority: 4,
        is_custom: false,
        conditions: [
          { type: "source_domain", values: ["salesforce.com", "force.com"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "SF_[page_title]_[YYYY-MM-DD]",
          move_to: "Salesforce/"
        },
        created_at: now()
      }
    ]
  },

  finance: {
    label: "Finance & Accounting",
    emoji: "💰",
    description: "Receipts, bank statements, tax docs, payroll",
    rules: [
      {
        id: "fin_001",
        name: "Payment Receipt",
        pack: "finance",
        active: true,
        priority: 1,
        is_custom: false,
        conditions: [
          {
            type: "source_domain",
            values: [
              "stripe.com",
              "paypal.com",
              "square.com",
              "braintree.com"
            ]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Receipt_[domain]_[YYYY-MM-DD]",
          move_to: "Finance/Receipts/[YYYY-MM]/"
        },
        created_at: now()
      },
      {
        id: "fin_002",
        name: "Bank Statement",
        pack: "finance",
        active: true,
        priority: 2,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["statement", "estatement", "bank_"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Statement_[domain]_[YYYY-MM-DD]",
          move_to: "Finance/Statements/"
        },
        created_at: now()
      },
      {
        id: "fin_003",
        name: "Tax Document",
        pack: "finance",
        active: true,
        priority: 3,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["tax", "t4", "t1", "w2", "w-2", "1099", "roe"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Tax_[page_title]_[YYYY]",
          move_to: "Finance/Tax/[YYYY]/"
        },
        created_at: now()
      },
      {
        id: "fin_004",
        name: "Payroll",
        pack: "finance",
        active: true,
        priority: 4,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["payroll", "paystub", "pay_stub", "payslip"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Payroll_[YYYY-MM-DD]",
          move_to: "Finance/Payroll/"
        },
        created_at: now()
      }
    ]
  },

  student: {
    label: "Student",
    emoji: "🎓",
    description: "Lectures, assignments, research papers, syllabi",
    rules: [
      {
        id: "stu_001",
        name: "Lecture Slides",
        pack: "student",
        active: true,
        priority: 1,
        is_custom: false,
        conditions: [
          { type: "file_extension", values: [".pptx", ".ppt"] },
          {
            type: "filename_contains",
            values: ["lecture", "slides", "week", "module", "chapter"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Studies/Slides/"
        },
        created_at: now()
      },
      {
        id: "stu_002",
        name: "Assignment",
        pack: "student",
        active: true,
        priority: 2,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["assignment", "homework", "hw_", "task"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Studies/Assignments/"
        },
        created_at: now()
      },
      {
        id: "stu_003",
        name: "Syllabus",
        pack: "student",
        active: true,
        priority: 3,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["syllabus", "course outline", "curriculum"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Studies/Syllabi/"
        },
        created_at: now()
      },
      {
        id: "stu_004",
        name: "Research Paper",
        pack: "student",
        active: true,
        priority: 4,
        is_custom: false,
        conditions: [
          {
            type: "source_domain",
            values: [
              "arxiv.org",
              "scholar.google.com",
              "researchgate.net",
              "jstor.org",
              "pubmed.ncbi.nlm.nih.gov"
            ]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Studies/Research/"
        },
        created_at: now()
      }
    ]
  },

  shopper: {
    label: "Online Shopper",
    emoji: "🛍️",
    description: "Order confirmations, receipts, returns",
    rules: [
      {
        id: "shop_001",
        name: "Order Confirmation",
        pack: "shopper",
        active: true,
        priority: 1,
        is_custom: false,
        conditions: [
          {
            type: "filename_contains",
            values: ["order", "confirmation", "receipt"]
          },
          {
            type: "source_domain",
            values: ["amazon.com", "amazon.ca", "ebay.com", "etsy.com"]
          }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Order_[domain]_[YYYY-MM-DD]",
          move_to: "Shopping/Orders/"
        },
        created_at: now()
      },
      {
        id: "shop_002",
        name: "Return Label",
        pack: "shopper",
        active: true,
        priority: 2,
        is_custom: false,
        conditions: [
          { type: "filename_contains", values: ["return", "refund", "label"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "Return_[domain]_[YYYY-MM-DD]",
          move_to: "Shopping/Returns/"
        },
        created_at: now()
      }
    ]
  },

  professional: {
    label: "General Professional",
    emoji: "🖥️",
    description: "Reports, presentations, spreadsheets, archives",
    rules: [
      {
        id: "pro_001",
        name: "Presentations",
        pack: "professional",
        active: true,
        priority: 1,
        is_custom: false,
        conditions: [
          { type: "file_extension", values: [".pptx", ".ppt", ".key"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Presentations/"
        },
        created_at: now()
      },
      {
        id: "pro_002",
        name: "Spreadsheets",
        pack: "professional",
        active: true,
        priority: 2,
        is_custom: false,
        conditions: [
          { type: "file_extension", values: [".xlsx", ".xls", ".csv"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Spreadsheets/"
        },
        created_at: now()
      },
      {
        id: "pro_003",
        name: "Archives",
        pack: "professional",
        active: true,
        priority: 3,
        is_custom: false,
        conditions: [
          { type: "file_extension", values: [".zip", ".rar", ".tar", ".gz"] }
        ],
        condition_logic: "ANY",
        actions: {
          rename_to: "[page_title]_[YYYY-MM-DD]",
          move_to: "Archives/"
        },
        created_at: now()
      }
    ]
  }
}

export function getRulesForPacks(packs: PersonaPack[]): Rule[] {
  const out: Rule[] = []
  let priorityOffset = 0
  for (const pack of packs) {
    const packRules = PACKS[pack]?.rules ?? []
    for (const rule of packRules) {
      out.push({ ...rule, priority: rule.priority + priorityOffset })
    }
    priorityOffset += 100
  }
  return out
}
