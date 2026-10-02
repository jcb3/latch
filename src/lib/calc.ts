import type { Numbers } from "./types"

export const TAX_CAP = 80
export const RUNWAY_MONTHS = 6
export const BOOKED_WEEKS = 6
export const SIDE_BILLABLE = 0.75
export const WEEKS_PER_MONTH = 52 / 12
export const JOB_HOURS_PER_MONTH = (40 * 52) / 12

export type GateId = "runway" | "income" | "booked" | "coverage"

export type Gate = {
  id: GateId
  title: string
  met: boolean
  status: string
}

export type PlanMath = {
  quitNumber: number
  grossTarget: number
  dayJobHourly: number
  packageHourly: number
  sideRevenue: number
  sideKept: number
  fullRevenue: number
  fullKept: number
  fullShortfall: number
  runwayTarget: number
  runwayGap: number
  monthsToRunway: number | null
  sideHoursNeeded: number
  sideHoursAvailable: number
  sideOverCapacity: boolean
  fullHoursNeeded: number
  fullHoursAvailable: number
  fullOverCapacity: boolean
  projectsNeeded: number | null
  hoursNeededForQuit: number | null
  gates: Gate[]
  gatesMet: number
  readyToQuit: boolean
}

function clean(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

function keptAfterTax(revenue: number, costs: number, taxPct: number): number {
  const profit = revenue - costs
  if (profit <= 0) return profit
  return profit * (1 - taxPct / 100)
}

export function compute(input: Numbers, coverageLinedUp: boolean): PlanMath {
  const expenses = clean(input.monthlyExpenses)
  const health = clean(input.healthInsurance)
  const retirement = clean(input.retirement)
  const cash = clean(input.cashOnHand)
  const takeHome = clean(input.monthlyTakeHome)
  const tax = Math.min(TAX_CAP, clean(input.taxBufferPct))
  const price = clean(input.projectPrice)
  const hoursPer = clean(input.hoursPerProject)
  const costs = clean(input.studioCosts)
  const retainers = clean(input.monthlyRetainers)
  const sideProjects = clean(input.projectsPerMonthSide)
  const fullProjects = clean(input.projectsPerMonthFull)
  const sideHoursWeek = clean(input.studioHoursPerWeek)
  const fullHoursWeek = clean(input.fullTimeBillableHours)
  const weeksBooked = clean(input.weeksBooked)
  const recent = input.recentRevenue.map(clean)

  const quitNumber = expenses + health + retirement
  const divisor = 1 - tax / 100
  const grossTarget = quitNumber / divisor + costs

  const sideRevenue = sideProjects * price + retainers
  const fullRevenue = fullProjects * price + retainers
  const sideKept = keptAfterTax(sideRevenue, costs, tax)
  const fullKept = keptAfterTax(fullRevenue, costs, tax)

  const runwayTarget = expenses * RUNWAY_MONTHS
  const runwayGap = Math.max(0, runwayTarget - cash)
  const monthsToRunway =
    runwayGap === 0 ? 0 : sideKept > 0 ? runwayGap / sideKept : null

  const sideHoursAvailable = sideHoursWeek * WEEKS_PER_MONTH * SIDE_BILLABLE
  const sideHoursNeeded = sideProjects * hoursPer
  const fullHoursAvailable = fullHoursWeek * WEEKS_PER_MONTH
  const fullHoursNeeded = fullProjects * hoursPer

  const buildNeeded = Math.max(0, grossTarget - retainers)
  const projectsNeeded = price > 0 ? buildNeeded / price : buildNeeded === 0 ? 0 : null
  const hoursNeededForQuit =
    projectsNeeded === null ? null : projectsNeeded * hoursPer

  const incomeMet = recent.length === 3 && recent.every((amount) => amount + 0.5 >= grossTarget)
  const runwayMet = cash + 0.5 >= runwayTarget
  const bookedMet = weeksBooked + 0.001 >= BOOKED_WEEKS

  const gates: Gate[] = [
    {
      id: "runway",
      title: "Cash runway",
      met: runwayMet,
      status: runwayMet
        ? `${cash} covers six months of personal expenses.`
        : `Six months of expenses is still short.`,
    },
    {
      id: "income",
      title: "Three steady months",
      met: incomeMet,
      status: incomeMet
        ? "The last three months each cleared the revenue line."
        : "Three consecutive months still have to clear the revenue line.",
    },
    {
      id: "booked",
      title: "Work already signed",
      met: bookedMet,
      status: bookedMet
        ? "At least six weeks of paid work is signed."
        : "Six weeks of signed work is the minimum before notice.",
    },
    {
      id: "coverage",
      title: "Health coverage",
      met: coverageLinedUp,
      status: coverageLinedUp
        ? "Coverage is marked as lined up."
        : "A quote, or a partner’s plan in writing, still has to be real.",
    },
  ]

  return {
    quitNumber,
    grossTarget,
    dayJobHourly: takeHome > 0 ? takeHome / JOB_HOURS_PER_MONTH : 0,
    packageHourly: hoursPer > 0 ? price / hoursPer : 0,
    sideRevenue,
    sideKept,
    fullRevenue,
    fullKept,
    fullShortfall: quitNumber - fullKept,
    runwayTarget,
    runwayGap,
    monthsToRunway,
    sideHoursNeeded,
    sideHoursAvailable,
    sideOverCapacity: sideHoursNeeded > sideHoursAvailable + 0.05,
    fullHoursNeeded,
    fullHoursAvailable,
    fullOverCapacity: fullHoursNeeded > fullHoursAvailable + 0.05,
    projectsNeeded,
    hoursNeededForQuit,
    gates,
    gatesMet: gates.filter((gate) => gate.met).length,
    readyToQuit: gates.every((gate) => gate.met),
  }
}
