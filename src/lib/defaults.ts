import type { Lead, Numbers, PackageOffer, Stage, StudioState } from "@/lib/types"

export const defaultNumbers: Numbers = {
  monthlyTakeHome: 5800,
  monthlyExpenses: 4200,
  cashOnHand: 8000,
  healthInsurance: 620,
  retirement: 400,
  taxBufferPct: 30,
  studioHoursPerWeek: 8,
  fullTimeBillableHours: 24,
  projectPrice: 4500,
  hoursPerProject: 28,
  projectsPerMonthSide: 0.5,
  projectsPerMonthFull: 1.5,
  studioCosts: 80,
  monthlyRetainers: 0,
  weeksBooked: 0,
  recentRevenue: [0, 0, 0],
}

export const defaultPackages: PackageOffer[] = [
  {
    id: "brochure",
    name: "Brochure",
    price: 3200,
    cadence: "3 weeks",
    summary:
      "A five-page site for a local business that already has customers and a site that doesn't help them. Mobile-first, one revision round, and a launch checklist.",
    includes:
      "Up to 5 pages\nMobile layout\nContact form\nOne revision round\nTwo weeks of bug fixes after launch",
  },
  {
    id: "conversion",
    name: "Conversion site",
    price: 6800,
    cadence: "5 weeks",
    summary:
      "A designed marketing site with a clear path to a call, a booking, or a quote. The middle package is the one you want them to buy.",
    includes:
      "Custom design\nUp to 8 pages\nEditable text and images\nAnalytics\nTwo revision rounds",
  },
  {
    id: "care",
    name: "Care",
    price: 350,
    cadence: "monthly",
    summary:
      "After launch: small edits, a check that the forms still work, and a short note on what to improve. This is the income that steadies the months between builds.",
    includes:
      "Up to 2 hours of edits\nForm and uptime check\nBackup check\nNew pages quoted separately",
  },
]

export const defaultNiche =
  "Independent clinics that want new patients to book without calling"

export const defaultOffer =
  "I build booking sites for independent clinics so new patients can schedule without calling the front desk."

export const defaultState: StudioState = {
  checked: {},
  numbers: defaultNumbers,
  packages: defaultPackages,
  leads: [],
  niche: defaultNiche,
  offer: defaultOffer,
}

const stages: readonly Stage[] = ["new", "talking", "proposal", "won", "passed"]

export function isStage(value: unknown): value is Stage {
  return typeof value === "string" && stages.includes(value as Stage)
}

function num(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function mergeNumbers(value: unknown): Numbers {
  const raw = value && typeof value === "object" ? (value as Partial<Numbers>) : {}
  const recent = Array.isArray(raw.recentRevenue) ? raw.recentRevenue : []
  return {
    monthlyTakeHome: num(raw.monthlyTakeHome, defaultNumbers.monthlyTakeHome),
    monthlyExpenses: num(raw.monthlyExpenses, defaultNumbers.monthlyExpenses),
    cashOnHand: num(raw.cashOnHand, defaultNumbers.cashOnHand),
    healthInsurance: num(raw.healthInsurance, defaultNumbers.healthInsurance),
    retirement: num(raw.retirement, defaultNumbers.retirement),
    taxBufferPct: num(raw.taxBufferPct, defaultNumbers.taxBufferPct),
    studioHoursPerWeek: num(raw.studioHoursPerWeek, defaultNumbers.studioHoursPerWeek),
    fullTimeBillableHours: num(
      raw.fullTimeBillableHours,
      defaultNumbers.fullTimeBillableHours,
    ),
    projectPrice: num(raw.projectPrice, defaultNumbers.projectPrice),
    hoursPerProject: num(raw.hoursPerProject, defaultNumbers.hoursPerProject),
    projectsPerMonthSide: num(
      raw.projectsPerMonthSide,
      defaultNumbers.projectsPerMonthSide,
    ),
    projectsPerMonthFull: num(
      raw.projectsPerMonthFull,
      defaultNumbers.projectsPerMonthFull,
    ),
    studioCosts: num(raw.studioCosts, defaultNumbers.studioCosts),
    monthlyRetainers: num(raw.monthlyRetainers, defaultNumbers.monthlyRetainers),
    weeksBooked: num(raw.weeksBooked, defaultNumbers.weeksBooked),
    recentRevenue: [
      num(recent[0], 0),
      num(recent[1], 0),
      num(recent[2], 0),
    ],
  }
}

function mergePackages(value: unknown): PackageOffer[] {
  if (!Array.isArray(value) || value.length === 0) return defaultPackages
  return value.map((item, index) => {
    const fallback = defaultPackages[index] ?? defaultPackages[0]
    const raw = item && typeof item === "object" ? (item as Partial<PackageOffer>) : {}
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : fallback.id,
      name: typeof raw.name === "string" ? raw.name : fallback.name,
      price: num(raw.price, fallback.price),
      cadence: typeof raw.cadence === "string" ? raw.cadence : fallback.cadence,
      summary: typeof raw.summary === "string" ? raw.summary : fallback.summary,
      includes: typeof raw.includes === "string" ? raw.includes : fallback.includes,
    }
  })
}

function mergeLeads(value: unknown): Lead[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const raw = item as Partial<Lead>
    if (typeof raw.id !== "string" || !raw.id) return []
    return [
      {
        id: raw.id,
        contact: typeof raw.contact === "string" ? raw.contact : "",
        business: typeof raw.business === "string" ? raw.business : "",
        stage: isStage(raw.stage) ? raw.stage : "new",
        value: num(raw.value, 0),
        nextStep: typeof raw.nextStep === "string" ? raw.nextStep : "",
        due: typeof raw.due === "string" ? raw.due : "",
      },
    ]
  })
}

export function mergeState(value: unknown): StudioState {
  const raw = value && typeof value === "object" ? (value as Partial<StudioState>) : {}
  const checked =
    raw.checked && typeof raw.checked === "object" ? raw.checked : {}
  const safeChecked: Record<string, boolean> = {}
  for (const [key, entry] of Object.entries(checked)) {
    if (entry === true) safeChecked[key] = true
  }
  return {
    checked: safeChecked,
    numbers: mergeNumbers(raw.numbers),
    packages: mergePackages(raw.packages),
    leads: mergeLeads(raw.leads),
    niche: typeof raw.niche === "string" ? raw.niche : defaultNiche,
    offer: typeof raw.offer === "string" ? raw.offer : defaultOffer,
  }
}

export function numbersMatchDefault(numbers: Numbers): boolean {
  const keys = Object.keys(defaultNumbers) as (keyof Numbers)[]
  return keys.every((key) => {
    const current = numbers[key]
    const fallback = defaultNumbers[key]
    if (Array.isArray(current) && Array.isArray(fallback)) {
      return current.every((entry, index) => entry === fallback[index])
    }
    return current === fallback
  })
}
