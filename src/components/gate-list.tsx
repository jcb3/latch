import type { PlanMath } from "@/lib/calc"
import { money, oneDecimal } from "@/lib/format"
import type { Numbers } from "@/lib/types"
import { cn } from "@/lib/utils"

function detail(id: PlanMath["gates"][number]["id"], math: PlanMath, numbers: Numbers) {
  if (id === "runway") {
    return math.gates.find((gate) => gate.id === "runway")?.met
      ? `${money(numbers.cashOnHand)} is on hand. Six months of expenses is ${money(math.runwayTarget)}.`
      : `${money(Math.max(0, numbers.cashOnHand))} on hand. Six months of expenses is ${money(math.runwayTarget)}, so the gap is ${money(math.runwayGap)}.`
  }
  if (id === "income") {
    return math.gates.find((gate) => gate.id === "income")?.met
      ? `Each of the last three months collected at least ${money(math.grossTarget)}.`
      : `Each month needs to collect ${money(math.grossTarget)}. One strong month leaves this gate shut.`
  }
  if (id === "booked") {
    return math.gates.find((gate) => gate.id === "booked")?.met
      ? `${oneDecimal(numbers.weeksBooked)} weeks of paid work are signed.`
      : `${oneDecimal(numbers.weeksBooked)} weeks signed. Notice waits until six weeks are on paper.`
  }
  return math.gates.find((gate) => gate.id === "coverage")?.met
    ? "Health coverage is marked as lined up."
    : "Check “Line up health coverage” in the last phase once a quote, or a partner’s plan, is real."
}

export function GateList({
  math,
  numbers,
}: {
  math: PlanMath
  numbers: Numbers
}) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {math.gates.map((gate) => (
        <li key={gate.id} className="flex gap-3 py-3">
          <span
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] text-[11px] font-medium",
              gate.met ? "bg-moss text-white" : "border border-border bg-card text-transparent",
            )}
            aria-hidden
          >
            ✓
          </span>
          <span>
            <span className="block text-sm font-medium">{gate.title}</span>
            <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
              {detail(gate.id, math, numbers)}
            </span>
          </span>
          <span className="sr-only">{gate.met ? "Open" : "Shut"}</span>
        </li>
      ))}
    </ul>
  )
}
