/**
 * Run with: npx tsx tests/naming.test.ts
 * Tests the 4-step naming priority chain against 25 real download scenarios.
 */

import { determineName, type NamingContext, type NamingResult } from "../lib/naming"

interface Case {
  label: string
  ctx: NamingContext
  expect: {
    method: NamingResult["method"]
    baseName: string
  }
}

const cases: Case[] = [
  // ──── Page title extraction ────────────────────────────────────────────

  {
    label: "Clean page title — stripped of app suffix",
    ctx: {
      downloadUrl: "https://docs.google.com/document/d/abc123/export?format=pdf",
      originalFilename: "document.pdf",
      pageTitle: "Q2 Revenue Report - Google Drive"
    },
    expect: { method: "page_title", baseName: "Q2_Revenue_Report" }
  },
  {
    label: "Notion page title with em dash",
    ctx: {
      downloadUrl: "https://notion.so/export/abc123.pdf",
      originalFilename: "export.pdf",
      pageTitle: "Product Roadmap 2026 — Notion"
    },
    expect: { method: "page_title", baseName: "Product_Roadmap_2026" }
  },
  {
    label: "Page title with pipe separator",
    ctx: {
      downloadUrl: "https://acme.com/reports/annual.pdf",
      originalFilename: "annual.pdf",
      pageTitle: "Annual Report 2025 | Acme Corp"
    },
    expect: { method: "page_title", baseName: "Annual_Report_2025" }
  },
  {
    label: "Short meaningful title (3+ chars)",
    ctx: {
      downloadUrl: "https://example.com/file.pdf",
      originalFilename: "file.pdf",
      pageTitle: "SOW"
    },
    expect: { method: "page_title", baseName: "SOW" }
  },
  {
    label: "Title longer than 50 chars is truncated at word boundary",
    ctx: {
      downloadUrl: "https://example.com/file.pdf",
      originalFilename: "file.pdf",
      pageTitle: "This Is A Very Long Page Title That Should Be Truncated At A Word Boundary"
    },
    expect: { method: "page_title", baseName: "This_Is_A_Very_Long_Page_Title_That_Should_Be" }
  },

  // ──── Title blacklist — falls through to URL/domain ───────────────────

  {
    label: "Blacklisted title 'Notion' falls through to URL segment",
    ctx: {
      downloadUrl: "https://notion.so/export/myfile.pdf",
      originalFilename: "myfile.pdf",
      pageTitle: "Notion"
    },
    // 'export' is GENERIC_NAMES so it's skipped; 'myfile' is the meaningful segment
    expect: { method: "url_path", baseName: "myfile" }
  },
  {
    label: "Blacklisted title 'Dashboard' falls through",
    ctx: {
      downloadUrl: "https://stripe.com/dashboard/payments/export.csv",
      originalFilename: "export.csv",
      pageTitle: "Dashboard"
    },
    expect: { method: "url_path", baseName: "payments" }
  },
  {
    label: "Blacklisted title 'Sign in' falls through to URL filename",
    ctx: {
      downloadUrl: "https://salesforce.com/reports/download/abc.csv",
      originalFilename: "abc.csv",
      pageTitle: "Sign in"
    },
    // 'abc' is 3 chars (≥ threshold), has vowel; chosen before 'reports' because we scan last→first
    expect: { method: "url_path", baseName: "abc" }
  },
  {
    label: "Blank page title falls through",
    ctx: {
      downloadUrl: "https://github.com/user/repo/releases/download/v1.0/app.zip",
      originalFilename: "app.zip",
      pageTitle: ""
    },
    expect: { method: "url_path", baseName: "app" }
  },
  {
    label: "No page title falls through",
    ctx: {
      downloadUrl: "https://github.com/user/repo/releases/download/v1.0/filer.zip",
      originalFilename: "filer.zip"
    },
    expect: { method: "url_path", baseName: "filer" }
  },

  // ──── URL path extraction ──────────────────────────────────────────────

  {
    label: "GitHub release download — extracts filename from path",
    ctx: {
      downloadUrl: "https://github.com/user/repo/releases/download/v2.1.0/installer.exe",
      originalFilename: "installer.exe",
      pageTitle: "GitHub"
    },
    expect: { method: "url_path", baseName: "installer" }
  },
  {
    label: "UUID path segment is skipped, falls back to earlier segment",
    ctx: {
      downloadUrl: "https://api.example.com/files/documents/3f0a9b12-dead-beef-cafe-1234567890ab",
      originalFilename: "file.pdf",
      pageTitle: "home"
    },
    expect: { method: "url_path", baseName: "documents" }
  },
  {
    label: "Hash-like path segment is skipped",
    ctx: {
      downloadUrl: "https://cdn.example.com/assets/a1b2c3d4e5f6a1b2/report.pdf",
      originalFilename: "report.pdf",
      pageTitle: "loading"
    },
    expect: { method: "url_path", baseName: "report" }
  },
  {
    label: "Timestamp segment is skipped",
    ctx: {
      downloadUrl: "https://export.example.com/1718467200/results.csv",
      originalFilename: "results.csv",
      pageTitle: "new tab"
    },
    expect: { method: "url_path", baseName: "results" }
  },
  {
    label: "Pure numeric segment is skipped",
    ctx: {
      downloadUrl: "https://example.com/orders/42891/invoice.pdf",
      originalFilename: "invoice.pdf",
      pageTitle: "untitled"
    },
    expect: { method: "url_path", baseName: "invoice" }
  },
  {
    label: "App name as sole page title is used directly",
    ctx: {
      downloadUrl: "https://airtable.com/export",
      originalFilename: "export.csv",
      pageTitle: "Airtable"
    },
    // "Airtable" is not blacklisted, so page_title wins
    expect: { method: "page_title", baseName: "Airtable" }
  },

  // ──── Domain fallback ──────────────────────────────────────────────────

  {
    label: "Stripe: meaningful URL segment wins over domain fallback",
    ctx: {
      downloadUrl: "https://stripe.com/receipts/12345",
      originalFilename: "abc123def456ghi7.pdf",
      pageTitle: "Dashboard"
    },
    // numeric '12345' is skipped; 'receipts' is a valid segment
    expect: { method: "url_path", baseName: "receipts" }
  },
  {
    label: "Dropbox share token extracted from URL path",
    ctx: {
      downloadUrl: "https://dropbox.com/s/abc123/",
      originalFilename: "document.pdf",
      pageTitle: "Dropbox"
    },
    // 's' has length < 3 so is skipped; 'abc123' has vowels and length 6
    expect: { method: "url_path", baseName: "abc123" }
  },
  {
    label: "Short meaningful URL path segment over domain fallback",
    ctx: {
      downloadUrl: "https://acme.io/files/data.xlsx",
      originalFilename: "data.xlsx",
      pageTitle: "untitled spreadsheet"
    },
    // 'data' is not in GENERIC_NAMES, gets extracted
    expect: { method: "url_path", baseName: "data" }
  },

  // ──── Filename cleanup ─────────────────────────────────────────────────

  {
    label: "Duplicate suffix (1) is stripped",
    ctx: {
      downloadUrl: "blob:https://example.com/abc123",
      originalFilename: "Monthly Report (1).pdf",
      pageTitle: "loading"
    },
    expect: { method: "filename_cleanup", baseName: "Monthly_Report" }
  },
  {
    label: "Timestamp suffix stripped; generic remainder returns 'File'",
    ctx: {
      downloadUrl: "blob:https://example.com/xyz",
      originalFilename: "export_1718467200000.csv",
      pageTitle: "untitled"
    },
    // timestamp stripped → "export" which is in GENERIC_NAMES → falls back to "File"
    expect: { method: "filename_cleanup", baseName: "File" }
  },
  {
    label: "Hash suffix in filename is stripped",
    ctx: {
      downloadUrl: "blob:https://example.com/abc",
      originalFilename: "report-a1b2c3d4e5f6.pdf",
      pageTitle: ""
    },
    expect: { method: "filename_cleanup", baseName: "report" }
  },
  {
    label: "Generic filename 'file' falls back to 'File'",
    ctx: {
      downloadUrl: "blob:https://example.com/xyz",
      originalFilename: "file.pdf",
      pageTitle: ""
    },
    expect: { method: "filename_cleanup", baseName: "File" }
  },
  {
    label: "Generic filename 'document' falls back to 'File'",
    ctx: {
      downloadUrl: "blob:https://example.com/xyz",
      originalFilename: "document.pdf",
      pageTitle: ""
    },
    expect: { method: "filename_cleanup", baseName: "File" }
  },
  {
    label: "URL-encoded filename is decoded",
    ctx: {
      downloadUrl: "https://example.com/docs/Q3%20Budget%20Review.pdf",
      originalFilename: "Q3 Budget Review.pdf",
      pageTitle: "loading"
    },
    expect: { method: "url_path", baseName: "Q3_Budget_Review" }
  }
]

// ──── Runner ──────────────────────────────────────────────────────────────

let passed = 0
let failed = 0

for (const { label, ctx, expect: ex } of cases) {
  const result = determineName(ctx)
  const ok = result.method === ex.method && result.baseName === ex.baseName
  if (ok) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    console.error(`  ❌ ${label}`)
    if (result.method !== ex.method) {
      console.error(`       method:   got "${result.method}", want "${ex.method}"`)
    }
    if (result.baseName !== ex.baseName) {
      console.error(`       baseName: got "${result.baseName}", want "${ex.baseName}"`)
    }
    failed++
  }
}

console.log(`\n${passed}/${cases.length} passed${failed > 0 ? `, ${failed} failed` : ""}`)
if (failed > 0) process.exit(1)
