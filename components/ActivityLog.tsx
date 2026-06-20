import { Download, Search } from "lucide-react"
import { useMemo, useState } from "react"
import type { ActivityEntry } from "../types"
import { useT } from "../contexts/I18nContext"
import { Badge, Button } from "./ui"

interface Props {
  entries: ActivityEntry[]
  isPaid: boolean
  onUpgrade: () => void
}

type DateFilter = "today" | "week" | "month" | "all"
type MethodFilter = ActivityEntry["naming_method"] | "all"

const METHOD_COLORS: Record<
  ActivityEntry["naming_method"],
  "accent" | "success" | "warning" | "muted"
> = {
  rule_match: "accent",
  page_title: "success",
  url_path: "warning",
  domain_fallback: "muted",
  filename_cleanup: "muted"
}

export function ActivityLog({ entries, isPaid, onUpgrade }: Props) {
  const { t } = useT()
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [domainSearch, setDomainSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all")

  const MAX_DAYS_FREE = 30

  const METHOD_LABELS: Record<ActivityEntry["naming_method"], string> = {
    rule_match: t("activity.method.rule"),
    page_title: t("activity.method.page_title"),
    url_path: t("activity.method.url"),
    domain_fallback: t("activity.method.domain"),
    filename_cleanup: t("activity.method.cleaned")
  }

  const visibleEntries = useMemo(() => {
    let list = [...entries]

    if (!isPaid) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - MAX_DAYS_FREE)
      list = list.filter((e) => new Date(e.timestamp) > cutoff)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const cutoffs: Record<Exclude<DateFilter, "all">, Date> = {
        today: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        week: new Date(now.getTime() - 7 * 86400000),
        month: new Date(now.getTime() - 30 * 86400000)
      }
      list = list.filter((e) => new Date(e.timestamp) > cutoffs[dateFilter])
    }

    if (domainSearch.trim()) {
      const q = domainSearch.toLowerCase()
      list = list.filter((e) => e.source_domain.toLowerCase().includes(q))
    }

    if (methodFilter !== "all") {
      list = list.filter((e) => e.naming_method === methodFilter)
    }

    return list
  }, [entries, dateFilter, domainSearch, methodFilter, isPaid])

  function exportCSV() {
    const headers = [
      t("activity.col.time"),
      t("activity.col.original"),
      t("activity.col.renamed"),
      t("activity.col.folder"),
      t("activity.col.source"),
      t("activity.col.method")
    ]
    const rows = visibleEntries.map((e) => [
      new Date(e.timestamp).toISOString(),
      e.original_name,
      e.final_name,
      e.folder,
      e.source_domain,
      METHOD_LABELS[e.naming_method]
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `filer-activity-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const dateOptions: { key: DateFilter; labelKey: string }[] = [
    { key: "today", labelKey: "activity.filter.today" },
    { key: "week", labelKey: "activity.filter.week" },
    { key: "month", labelKey: "activity.filter.month" },
    { key: "all", labelKey: "activity.filter.all" }
  ]

  const countLabel = t("activity.count", { n: visibleEntries.length, total: entries.length })

  return (
    <div className="flex flex-col gap-4">
      {!isPaid && (
        <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning/10 px-4 py-3">
          <p className="text-xs text-warning">{t("activity.free_note")}</p>
          <button onClick={onUpgrade} className="text-xs font-medium text-accent hover:underline">
            {t("common.upgrade")} →
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {dateOptions.map(({ key, labelKey }) => (
            <button
              key={key}
              onClick={() => setDateFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dateFilter === key
                  ? "bg-accent text-white"
                  : "bg-bg-card text-text-secondary hover:bg-bg-secondary"
              }`}>
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[160px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            placeholder={t("activity.filter.domain")}
            className="w-full rounded-md border border-border bg-bg-card py-1.5 pl-7 pr-3 text-xs text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
          className="rounded-md border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent">
          <option value="all">{t("activity.filter.method_all")}</option>
          {(Object.keys(METHOD_LABELS) as ActivityEntry["naming_method"][]).map((m) => (
            <option key={m} value={m}>{METHOD_LABELS[m]}</option>
          ))}
        </select>

        {isPaid ? (
          <Button size="sm" variant="secondary" onClick={exportCSV}>
            <Download size={13} /> {t("activity.export")}
          </Button>
        ) : (
          <button
            onClick={onUpgrade}
            className="flex items-center gap-1.5 rounded-md border border-border bg-bg-card px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Download size={13} />
            {t("activity.export")}
            <span className="ml-0.5 rounded px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{ background: "#d4af3722", color: "#d4af37" }}>Pro</span>
          </button>
        )}
      </div>

      {/* Table */}
      {visibleEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-text-secondary">
          <Search size={28} className="opacity-40" />
          <p className="text-sm">{t("activity.no_results")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-secondary text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3">{t("activity.col.renamed")}</th>
                <th className="px-4 py-3">{t("activity.col.folder")}</th>
                <th className="px-4 py-3">{t("activity.col.source")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className="group bg-bg-card hover:bg-bg-secondary transition-colors cursor-default"
                  title={[
                    `${t("activity.col.time")}: ${new Date(entry.timestamp).toLocaleString()}`,
                    `${t("activity.col.original")}: ${entry.original_name}`,
                    `${t("activity.col.method")}: ${METHOD_LABELS[entry.naming_method]}`
                  ].join("\n")}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="max-w-[220px] truncate text-xs font-medium text-text-primary">{entry.final_name}</span>
                      <div className="flex items-center gap-2">
                        <Badge color={METHOD_COLORS[entry.naming_method]}>{METHOD_LABELS[entry.naming_method]}</Badge>
                        <span className="text-[10px] text-text-secondary">{relativeTime(entry.timestamp)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-xs text-text-secondary">{entry.folder || "—"}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{entry.source_domain || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-text-secondary text-right">{countLabel}</p>
    </div>
  )
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "just now"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString()
}
