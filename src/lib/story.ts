import type { PlanMath } from "@/lib/calc"
import { formatMonths, money, oneDecimal } from "@/lib/format"
import type { Numbers } from "@/lib/types"

export function storyLines(math: PlanMath, numbers: Numbers): string[] {
  if (math.readyToQuit) {
    return [
      "All four gates are open. The studio can cover a month of your life, the cash is behind you, work is already signed, and health coverage is lined up.",
      "Give notice on the schedule your contract requires. Keep the first month lighter than a normal month, and keep selling through it. A full calendar feels like safety until the pipeline you built at night runs out.",
    ]
  }

  const lines: string[] = []
  const runway = math.gates.find((gate) => gate.id === "runway")
  if (runway?.met) {
    lines.push(
      `Runway is covered. ${money(math.runwayTarget)} is six months of personal expenses, and the cash is already there.`,
    )
  } else if (math.monthsToRunway === null) {
    lines.push(
      `Six months of expenses is ${money(math.runwayTarget)}. At this side-hustle pace the studio is not producing savings, so that gap stays where it is.`,
    )
  } else {
    lines.push(
      `Six months of expenses is ${money(math.runwayTarget)}. Saving what the side hustle keeps, after the tax buffer, funds the rest in about ${formatMonths(math.monthsToRunway)}.`,
    )
  }

  if (math.fullShortfall <= 0) {
    lines.push(
      `Full-time, ${oneDecimal(numbers.projectsPerMonthFull)} projects a month at ${money(numbers.projectPrice)} leaves about ${money(math.fullKept)} after studio costs and the tax buffer. Your life needs ${money(math.quitNumber)}. On paper, the sales pace covers it.`,
    )
  } else if (math.projectsNeeded !== null) {
    lines.push(
      `Full-time at ${money(numbers.projectPrice)}, covering ${money(math.quitNumber)} after the tax buffer takes about ${oneDecimal(math.projectsNeeded)} projects a month. The pace you entered leaves ${money(math.fullKept)}.`,
    )
  } else {
    lines.push(
      "The project price is zero, so the full-time pace cannot be turned into a project count. Set a price you would say out loud.",
    )
  }

  const shut = math.gates.filter((gate) => !gate.met).map((gate) => gate.title)
  lines.push(`Still shut: ${shut.join(", ")}. The job stays until those open.`)
  return lines
}
