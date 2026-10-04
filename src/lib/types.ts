import type { CallProspect } from "@/lib/call-list"

export type Stage = "new" | "talking" | "proposal" | "won" | "passed"

export type Numbers = {
  monthlyTakeHome: number
  monthlyExpenses: number
  cashOnHand: number
  healthInsurance: number
  retirement: number
  /** Share of studio profit to set aside for income tax and self-employment tax. */
  taxBufferPct: number
  studioHoursPerWeek: number
  fullTimeBillableHours: number
  projectPrice: number
  hoursPerProject: number
  projectsPerMonthSide: number
  projectsPerMonthFull: number
  studioCosts: number
  monthlyRetainers: number
  weeksBooked: number
  /** Collected studio revenue: two months ago, last month, this month. */
  recentRevenue: [number, number, number]
}

export type PackageOffer = {
  id: string
  name: string
  price: number
  cadence: string
  summary: string
  includes: string
}

export type GatheredCalls = {
  city: string
  state: string
  stateName: string
  checkedOn: string
  via: "arbiter" | "pages"
  arbiterNote: string
  prospects: CallProspect[]
  lookedFine: string[]
}

export type Lead = {
  id: string
  contact: string
  business: string
  stage: Stage
  value: number
  nextStep: string
  due: string
}

export type StudioState = {
  checked: Record<string, boolean>
  numbers: Numbers
  packages: PackageOffer[]
  leads: Lead[]
  niche: string
  offer: string
  gatheredCalls: GatheredCalls | null
}
