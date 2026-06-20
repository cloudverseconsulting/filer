// ── Single source of truth for all pricing and plan limits ──────────────────
// To update lifetime price: change LIFETIME_AMOUNT only.

const LIFETIME_AMOUNT = 29.99   // → 39.99 for next pricing tier

export const PRICING = {
  monthly: {
    amount: 4.99,
    display: "$4.99",
    perMonth: "$4.99/month",
  },
  lifetime: {
    amount: LIFETIME_AMOUNT,
    display: `$${LIFETIME_AMOUNT}`,
    isLaunchPricing: true,
  },
  free: {
    maxCustomRules: 3,
    maxActivePacks: 6,
    historyDays: 30,
  },
} as const

export type PlanType = "monthly" | "lifetime"
