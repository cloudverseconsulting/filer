import sharp from "sharp"
import { mkdirSync } from "fs"

const W = 1280, H = 800
const OUT = "build/store-screenshots"
mkdirSync(OUT, { recursive: true })

const NAVY = "#1a1f2e", NAVY2 = "#0f1320", GOLD = "#c9a961", CREAM = "#f8f6f1"
const SLATE = "#94a3b8", PANEL = "#222a3d", LINE = "#2d3347"
const SANS = "Helvetica Neue, Helvetica, Arial, sans-serif"
const MONO = "Menlo, Consolas, monospace"

// shared frame: gradient bg, gold eyebrow, big headline, then content
function frame(eyebrow, headline, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#20283a"/><stop offset="1" stop-color="${NAVY2}"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.10"/><stop offset="0.6" stop-color="${GOLD}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <!-- brand chip -->
  <g transform="translate(80,64)">
    <rect width="34" height="34" rx="9" fill="${NAVY}" stroke="${GOLD}" stroke-opacity="0.4"/>
    <g transform="translate(8,8) scale(0.036)">
      <path d="M115 183C115 166 128 153 145 153H222L260 191H367C384 191 397 204 397 221V341C397 358 384 371 367 371H145C128 371 115 358 115 341V183Z" fill="#fff" fill-opacity="0.95"/>
      <rect x="158" y="239" width="196" height="19" rx="9.5" fill="${GOLD}"/>
      <rect x="158" y="277" width="128" height="19" rx="9.5" fill="${GOLD}" opacity="0.65"/>
      <rect x="158" y="315" width="158" height="19" rx="9.5" fill="${GOLD}" opacity="0.35"/>
    </g>
    <text x="46" y="23" font-family="${SANS}" font-size="18" font-weight="700" fill="${CREAM}">Filer</text>
  </g>
  <text x="80" y="170" font-family="${MONO}" font-size="15" letter-spacing="4" fill="${GOLD}">${eyebrow}</text>
  <text x="80" y="226" font-family="${SANS}" font-size="42" font-weight="800" fill="${CREAM}" letter-spacing="-1">${headline}</text>
  ${content}
</svg>`
}

function fileBadge(x, y, label, color, bg) {
  return `<rect x="${x}" y="${y}" width="40" height="22" rx="5" fill="${bg}"/><text x="${x+20}" y="${y+15}" font-family="${MONO}" font-size="11" font-weight="700" fill="${color}" text-anchor="middle">${label}</text>`
}

// ---- 1. HERO: popup with activity ----
function shot1() {
  const rows = [
    { b: "PDF", bc: "#fde8e8", bt: "#b91c1c", name: "stripe-invoice-2025-06-20.pdf", rule: "Stripe Invoices", src: "stripe.com", folder: "Finance/Invoices" },
    { b: "ZIP", bc: "#fef3c7", bt: "#92400e", name: "github-release-v2.1.0.zip", rule: "Developer Pack", src: "github.com", folder: "Dev/Releases" },
    { b: "DOC", bc: "#dbeafe", bt: "#1e40af", name: "lecture-notes-econ101.docx", rule: "Student Pack", src: "canvas.edu", folder: "Uni/Notes" },
  ]
  const cardX = 340, cardY = 300, cardW = 600
  let rowsSvg = ""
  rows.forEach((r, i) => {
    const y = cardY + 86 + i * 92
    rowsSvg += `
      ${fileBadge(cardX + 28, y, r.b, r.bt, r.bc)}
      <text x="${cardX+82}" y="${y+13}" font-family="${SANS}" font-size="17" font-weight="600" fill="${CREAM}">${r.name}</text>
      <text x="${cardX+82}" y="${y+38}" font-family="${SANS}" font-size="13" fill="${SLATE}">${r.rule}  ·  ${r.src}</text>
      <rect x="${cardX+cardW-176}" y="${y+2}" width="150" height="24" rx="6" fill="${NAVY2}"/>
      <text x="${cardX+cardW-101}" y="${y+18}" font-family="${MONO}" font-size="12" fill="${GOLD}" text-anchor="middle">${r.folder}</text>
      ${i < rows.length-1 ? `<rect x="${cardX+24}" y="${y+62}" width="${cardW-48}" height="1" fill="${LINE}"/>` : ""}`
  })
  const content = `
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="396" rx="18" fill="${NAVY}" stroke="${LINE}"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="60" rx="18" fill="${PANEL}"/>
    <rect x="${cardX}" y="${cardY+40}" width="${cardW}" height="20" fill="${PANEL}"/>
    <text x="${cardX+28}" y="${cardY+38}" font-family="${SANS}" font-size="16" font-weight="700" fill="${CREAM}">Recent activity</text>
    <rect x="${cardX+cardW-92}" y="${cardY+18}" width="64" height="24" rx="12" fill="${GOLD}" opacity="0.15"/>
    <text x="${cardX+cardW-60}" y="${cardY+34}" font-family="${MONO}" font-size="11" fill="${GOLD}" text-anchor="middle">FREE</text>
    ${rowsSvg}`
  return frame("WORKS AUTOMATICALLY", "Every download, renamed and sorted.", content)
}

// ---- 2. BEFORE / AFTER ----
function shot2() {
  const before = ["document(3).pdf", "Screenshot 2025-06-20 at...", "invoice_final_FINAL.pdf", "download.zip", "IMG_4821.HEIC"]
  const after = [
    ["stripe-invoice-2025-06-20.pdf", "Finance/Invoices"],
    ["figma-export-dashboard.png", "Design/Exports"],
    ["acme-invoice-2025-06.pdf", "Finance/Invoices"],
    ["github-release-v2.1.0.zip", "Dev/Releases"],
    ["trip-photo-rome.heic", "Photos/Travel"],
  ]
  const colY = 300, bx = 80, ax = 700, colW = 500
  let b = "", a = ""
  before.forEach((n, i) => {
    const y = colY + 70 + i * 64
    b += `<rect x="${bx}" y="${y}" width="${colW}" height="48" rx="9" fill="#2a2230" stroke="#3a2f3a"/>
      <circle cx="${bx+26}" cy="${y+24}" r="5" fill="#ef4444"/>
      <text x="${bx+46}" y="${y+30}" font-family="${MONO}" font-size="15" fill="#cbb6b6">${n}</text>`
  })
  after.forEach(([n, f], i) => {
    const y = colY + 70 + i * 64
    a += `<rect x="${ax}" y="${y}" width="${colW}" height="48" rx="9" fill="#1f2b22" stroke="#2c3d2f"/>
      <circle cx="${ax+26}" cy="${y+24}" r="5" fill="#22c55e"/>
      <text x="${ax+46}" y="${y+24}" font-family="${MONO}" font-size="14" fill="${CREAM}">${n}</text>
      <text x="${ax+46}" y="${y+40}" font-family="${MONO}" font-size="11" fill="${GOLD}">${f}</text>`
  })
  const content = `
    <text x="${bx}" y="${colY+40}" font-family="${MONO}" font-size="13" letter-spacing="2" fill="${SLATE}">BEFORE</text>
    <text x="${ax}" y="${colY+40}" font-family="${MONO}" font-size="13" letter-spacing="2" fill="#5fb87a">AFTER · FILER</text>
    ${b}${a}
    <g transform="translate(615,${colY+250})"><circle r="26" fill="${GOLD}"/><path d="M-9 0 H9 M2 -7 L9 0 L2 7" stroke="${NAVY}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`
  return frame("THE PROBLEM, SOLVED", "No more document(3).pdf", content)
}

// ---- 3. RULES ----
function shot3() {
  const rules = [
    ["Stripe Invoices", "stripe.com → Finance/Invoices/stripe-invoice-{date}", "Custom"],
    ["GitHub Releases", "github.com → Dev/Releases/github-{original}-{year}", "Developer"],
    ["Lecture Notes", "canvas.edu → Uni/Notes/lecture-{date}", "Student"],
    ["Bank Statements", "*.bank → Finance/Statements/{date}-statement", "Finance"],
  ]
  const x = 80, y0 = 300, w = 1120
  let rs = ""
  rules.forEach(([n, d, tag], i) => {
    const y = y0 + 50 + i * 96
    rs += `<rect x="${x}" y="${y}" width="${w}" height="80" rx="12" fill="${NAVY}" stroke="${LINE}"/>
      <circle cx="${x+34}" cy="${y+40}" r="4" fill="${SLATE}"/><circle cx="${x+34}" cy="${y+28}" r="4" fill="${SLATE}"/><circle cx="${x+34}" cy="${y+52}" r="4" fill="${SLATE}"/>
      <text x="${x+64}" y="${y+34}" font-family="${SANS}" font-size="18" font-weight="700" fill="${CREAM}">${n}</text>
      <text x="${x+64}" y="${y+58}" font-family="${MONO}" font-size="13" fill="${SLATE}">${d}</text>
      <rect x="${x+w-230}" y="${y+27}" width="96" height="26" rx="6" fill="#2a2342"/>
      <text x="${x+w-182}" y="${y+44}" font-family="${MONO}" font-size="12" fill="#b89cf0" text-anchor="middle">${tag}</text>
      <rect x="${x+w-110}" y="${y+28}" width="46" height="24" rx="12" fill="${GOLD}"/><circle cx="${x+w-76}" cy="${y+40}" r="9" fill="#fff"/>`
  })
  return frame("FULLY CUSTOMISABLE", "Smart rules: by source, type, or date.", rs)
}

// ---- 4. PACKS ----
function shot4() {
  const packs = [
    ["Student", "S", "#6366f1"], ["Developer", "D", "#0ea5e9"], ["Finance", "F", "#22c55e"],
    ["Traveler", "T", "#f59e0b"], ["Health", "H", "#ef4444"], ["Homeowner", "H", "#8b5cf6"],
  ]
  const x0 = 80, y0 = 300, gap = 24, cw = 352, ch = 150, cols = 3
  let ps = ""
  packs.forEach(([n, ltr, col], i) => {
    const cx = x0 + (i % cols) * (cw + gap)
    const cy = y0 + 40 + Math.floor(i / cols) * (ch + gap)
    ps += `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="14" fill="${NAVY}" stroke="${LINE}"/>
      <rect x="${cx+24}" y="${cy+24}" width="46" height="46" rx="11" fill="${col}" opacity="0.18"/>
      <text x="${cx+47}" y="${cy+55}" font-family="${SANS}" font-size="22" font-weight="800" fill="${col}" text-anchor="middle">${ltr}</text>
      <text x="${cx+24}" y="${cy+100}" font-family="${SANS}" font-size="19" font-weight="700" fill="${CREAM}">${n}</text>
      <text x="${cx+24}" y="${cy+124}" font-family="${SANS}" font-size="13" fill="${SLATE}">Ready-made rules</text>
      <rect x="${cx+cw-110}" y="${cy+ch-46}" width="86" height="30" rx="8" fill="${GOLD}"/>
      <text x="${cx+cw-67}" y="${cy+ch-26}" font-family="${SANS}" font-size="13" font-weight="700" fill="${NAVY}" text-anchor="middle">Install</text>`
  })
  return frame("ZERO SETUP", "Ready-made packs for your workflow.", ps)
}

// ---- 5. THEMES + LANGUAGES ----
function shot5() {
  const themes = [["Dark", "#1a1f2e", GOLD], ["Light", "#f8f6f1", "#1a1f2e"], ["Midnight", "#0d1117", "#3b82f6"], ["Forest", "#16201a", "#5fb87a"], ["Warm", "#211c17", "#e0a060"]]
  const x0 = 80, ty = 320
  let ts = ""
  themes.forEach(([n, bg, ac], i) => {
    const cx = x0 + i * 230
    ts += `<rect x="${cx}" y="${ty}" width="200" height="130" rx="14" fill="${bg}" stroke="${LINE}"/>
      <rect x="${cx+20}" y="${ty+22}" width="120" height="12" rx="6" fill="${ac}"/>
      <rect x="${cx+20}" y="${ty+44}" width="80" height="10" rx="5" fill="${ac}" opacity="0.5"/>
      <rect x="${cx+20}" y="${ty+90}" width="70" height="22" rx="6" fill="${ac}"/>
      <text x="${cx+20}" y="${ty+162}" font-family="${SANS}" font-size="16" font-weight="600" fill="${CREAM}">${n}</text>`
  })
  const langs = ["English","Español","日本語","العربية","हिन्दी","中文","Français","Deutsch","Русский","한국어"]
  let ls = ""
  langs.forEach((l, i) => {
    const cx = x0 + (i % 5) * 230, cy = 560 + Math.floor(i/5) * 56
    ls += `<rect x="${cx}" y="${cy}" width="200" height="42" rx="10" fill="${NAVY}" stroke="${LINE}"/>
      <text x="${cx+20}" y="${cy+27}" font-family="${SANS}" font-size="16" fill="${CREAM}">${l}</text>`
  })
  const content = `<text x="80" y="290" font-family="${MONO}" font-size="13" letter-spacing="2" fill="${SLATE}">5 FREE THEMES</text>${ts}
    <text x="80" y="535" font-family="${MONO}" font-size="13" letter-spacing="2" fill="${SLATE}">30 LANGUAGES</text>${ls}`
  return frame("MAKE IT YOURS", "Themes and 30 languages built in.", content)
}

const shots = [["01-hero", shot1()], ["02-before-after", shot2()], ["03-rules", shot3()], ["04-packs", shot4()], ["05-themes", shot5()]]
for (const [name, svg] of shots) {
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`)
  const m = await sharp(`${OUT}/${name}.png`).metadata()
  console.log(`${name}.png  ${m.width}x${m.height}`)
}
console.log("done")
