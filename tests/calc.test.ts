import assert from "node:assert/strict"
import { test } from "node:test"
import { compute } from "../src/lib/calc.ts"
import { defaultNumbers } from "../src/lib/defaults.ts"
import type { Numbers } from "../src/lib/types.ts"

function numbers(patch: Partial<Numbers> = {}): Numbers {
  return {
    ...defaultNumbers,
    recentRevenue: [...defaultNumbers.recentRevenue] as Numbers["recentRevenue"],
    ...patch,
  }
}

test("quit number adds the life the studio has to pay for", () => {
  const math = compute(
    numbers({
      monthlyExpenses: 4000,
      healthInsurance: 500,
      retirement: 300,
      studioCosts: 100,
      taxBufferPct: 25,
    }),
    false,
  )
  assert.equal(math.quitNumber, 4800)
  assert.ok(Math.abs(math.grossTarget - (4800 / 0.75 + 100)) < 0.01)
})

test("runway uses six months of personal expenses and side-hustle savings", () => {
  const math = compute(
    numbers({
      monthlyExpenses: 4000,
      cashOnHand: 1000,
      healthInsurance: 0,
      retirement: 0,
      taxBufferPct: 25,
      studioCosts: 0,
      monthlyRetainers: 0,
      projectPrice: 2000,
      projectsPerMonthSide: 1,
    }),
    false,
  )
  assert.equal(math.runwayTarget, 24000)
  assert.equal(math.runwayGap, 23000)
  assert.equal(math.sideRevenue, 2000)
  assert.equal(math.sideKept, 1500)
  assert.ok(Math.abs((math.monthsToRunway ?? 0) - 23000 / 1500) < 0.001)
  assert.equal(math.gates.find((gate) => gate.id === "runway")?.met, false)
})

test("a funded runway and three months at the line open those gates", () => {
  const base = numbers({
    monthlyExpenses: 2000,
    healthInsurance: 0,
    retirement: 0,
    cashOnHand: 12000,
    taxBufferPct: 0,
    studioCosts: 0,
    monthlyRetainers: 0,
    projectPrice: 2000,
    weeksBooked: 6,
    recentRevenue: [2000, 2000, 2500],
  })
  const closed = compute(base, false)
  assert.equal(closed.gates.find((gate) => gate.id === "runway")?.met, true)
  assert.equal(closed.gates.find((gate) => gate.id === "income")?.met, true)
  assert.equal(closed.gates.find((gate) => gate.id === "booked")?.met, true)
  assert.equal(closed.gates.find((gate) => gate.id === "coverage")?.met, false)
  assert.equal(closed.readyToQuit, false)

  const open = compute(base, true)
  assert.equal(open.readyToQuit, true)
  assert.equal(open.gatesMet, 4)
})

test("one short month keeps the income gate shut", () => {
  const math = compute(
    numbers({
      monthlyExpenses: 1000,
      healthInsurance: 0,
      retirement: 0,
      taxBufferPct: 0,
      studioCosts: 0,
      recentRevenue: [1000, 1000, 999],
    }),
    true,
  )
  assert.equal(math.grossTarget, 1000)
  assert.equal(math.gates.find((gate) => gate.id === "income")?.met, false)
})

test("retainers reduce how many builds the quit number requires", () => {
  const math = compute(
    numbers({
      monthlyExpenses: 3000,
      healthInsurance: 0,
      retirement: 0,
      taxBufferPct: 0,
      studioCosts: 0,
      monthlyRetainers: 1000,
      projectPrice: 2000,
      projectsPerMonthFull: 1,
    }),
    false,
  )
  assert.equal(math.grossTarget, 3000)
  assert.equal(math.projectsNeeded, 1)
  assert.equal(math.fullRevenue, 3000)
  assert.equal(math.fullShortfall, 0)
})

test("a zero price cannot invent a project count when builds are still required", () => {
  const math = compute(
    numbers({
      monthlyExpenses: 1000,
      healthInsurance: 0,
      retirement: 0,
      taxBufferPct: 0,
      studioCosts: 0,
      projectPrice: 0,
      monthlyRetainers: 0,
    }),
    false,
  )
  assert.equal(math.projectsNeeded, null)
  assert.equal(math.packageHourly, 0)
})

test("negative inputs are treated as zero and the tax buffer stays capped", () => {
  const math = compute(
    numbers({
      monthlyExpenses: -50,
      cashOnHand: -10,
      taxBufferPct: 140,
      projectPrice: 1000,
      hoursPerProject: 10,
      studioCosts: 5000,
      projectsPerMonthSide: 1,
      monthlyRetainers: 0,
    }),
    false,
  )
  assert.equal(math.quitNumber, defaultNumbers.healthInsurance + defaultNumbers.retirement)
  assert.equal(math.runwayGap, 0)
  assert.ok(math.sideKept < 0)
  assert.equal(math.monthsToRunway, 0)
  assert.equal(math.packageHourly, 100)
  const quit = defaultNumbers.healthInsurance + defaultNumbers.retirement
  assert.ok(Math.abs(math.grossTarget - (quit / 0.2 + 5000)) < 0.01)
})

test("side hours count three quarters of the week as billable", () => {
  const math = compute(
    numbers({
      studioHoursPerWeek: 8,
      hoursPerProject: 40,
      projectsPerMonthSide: 1,
    }),
    false,
  )
  assert.ok(Math.abs(math.sideHoursAvailable - 8 * (52 / 12) * 0.75) < 0.001)
  assert.equal(math.sideHoursNeeded, 40)
  assert.equal(math.sideOverCapacity, true)
})
