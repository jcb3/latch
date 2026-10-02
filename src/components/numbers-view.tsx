"use client"

import { GateList } from "@/components/gate-list"
import { LoadingBlock } from "@/components/loading-block"
import { NumberField } from "@/components/number-field"
import { useStudio } from "@/components/studio-provider"
import { Button } from "@/components/ui/button"
import { WEEKS_PER_MONTH, compute } from "@/lib/calc"
import { numbersMatchDefault } from "@/lib/defaults"
import { formatMonths, money, oneDecimal } from "@/lib/format"
import { storyLines } from "@/lib/story"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMemo } from "react"

const months = ["Two months ago", "Last month", "This month"] as const

export function NumbersView() {
  const { ready, state, setNumbers } = useStudio()
  const math = useMemo(
    () => compute(state.numbers, Boolean(state.checked.coverage)),
    [state.checked.coverage, state.numbers],
  )
  const lines = useMemo(() => storyLines(math, state.numbers), [math, state.numbers])

  if (!ready) return <LoadingBlock label="Opening your numbers…" />

  const numbers = state.numbers
  const example = numbersMatchDefault(numbers)
  const middle = state.packages[1]
  const sixWeeks = math.fullRevenue * (6 / WEEKS_PER_MONTH)
  const hourlyGap = math.packageHourly - math.dayJobHourly

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">When you can leave</p>
      <h1 className="mt-3 max-w-2xl font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        The studio replaces the job when a month of your life is covered, three times in a row.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
        The quit number is personal expenses, health insurance, and the retirement contribution you want to keep. The studio has to collect more than that, because self-employment tax and income tax come off the top. The 30% buffer is a planning default for a US sole prop, not a filing instruction.
      </p>

      {example ? (
        <p className="mt-6 max-w-2xl rounded-xl bg-ember-soft px-4 py-3 text-sm leading-6 text-foreground">
          These figures are an example: about {money(5800)} take-home, {money(4200)} in expenses, and a {money(4500)} site. Replace them. The gates move as you type.
        </p>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="order-2 space-y-8 lg:order-1">
          <section className="space-y-4" aria-labelledby="life-heading">
            <h2 id="life-heading" className="font-heading text-2xl tracking-tight">
              The job and the life
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="take-home"
                label="Monthly take-home from the job"
                hint="What lands in your account now. Used to compare an hour of the job with an hour of a project."
                prefix="$"
                value={numbers.monthlyTakeHome}
                onChange={(value) => setNumbers({ monthlyTakeHome: value })}
                step={100}
              />
              <NumberField
                id="expenses"
                label="Monthly personal expenses"
                hint="Rent, food, debt, and the rest you cannot skip. This is what six months of runway is built from."
                prefix="$"
                value={numbers.monthlyExpenses}
                onChange={(value) => setNumbers({ monthlyExpenses: value })}
                step={100}
              />
              <NumberField
                id="cash"
                label="Cash you could live on"
                hint="Savings you would actually spend if the studio had a quiet quarter. Keep it separate from money the studio needs to operate."
                prefix="$"
                value={numbers.cashOnHand}
                onChange={(value) => setNumbers({ cashOnHand: value })}
                step={100}
              />
              <NumberField
                id="health"
                label="Health insurance, monthly"
                hint="A marketplace or COBRA quote. Zero is honest if a partner’s plan covers you and you have checked the coverage task."
                prefix="$"
                value={numbers.healthInsurance}
                onChange={(value) => setNumbers({ healthInsurance: value })}
                step={25}
              />
              <NumberField
                id="retirement"
                label="Retirement you want to keep"
                hint="The monthly amount you intend to keep saving after you leave. Leave it in the quit number so the studio does not eat it."
                prefix="$"
                value={numbers.retirement}
                onChange={(value) => setNumbers({ retirement: value })}
                step={50}
              />
              <NumberField
                id="tax"
                label="Tax buffer"
                hint="Share of studio profit to set aside. Side income stacks on your wages, so the rate while you are employed can be higher than the rate after you quit. A CPA sets the real percentage."
                suffix="%"
                value={numbers.taxBufferPct}
                onChange={(value) => setNumbers({ taxBufferPct: value })}
                max={80}
              />
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="project-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="project-heading" className="font-heading text-2xl tracking-tight">
                One project
              </h2>
              {middle ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setNumbers({ projectPrice: middle.price })}
                >
                  Use {middle.name}, {money(middle.price)}
                </Button>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="price"
                label="Price of a typical build"
                hint="The package you expect to sell most often, not the cheapest one."
                prefix="$"
                value={numbers.projectPrice}
                onChange={(value) => setNumbers({ projectPrice: value })}
                step={100}
              />
              <NumberField
                id="hours"
                label="Hours to deliver it"
                hint="Your hours, including revisions. Be dull and honest."
                suffix="hrs"
                value={numbers.hoursPerProject}
                onChange={(value) => setNumbers({ hoursPerProject: value })}
              />
              <NumberField
                id="costs"
                label="Monthly studio costs"
                hint="Domain, software, and the accountant. Personal expenses stay in the other section."
                prefix="$"
                value={numbers.studioCosts}
                onChange={(value) => setNumbers({ studioCosts: value })}
              />
              <NumberField
                id="retainers"
                label="Retainer income already coming in"
                hint="Care plans you are actually billing. A hope is a zero."
                prefix="$"
                value={numbers.monthlyRetainers}
                onChange={(value) => setNumbers({ monthlyRetainers: value })}
                step={50}
              />
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="pace-heading">
            <h2 id="pace-heading" className="font-heading text-2xl tracking-tight">
              The pace
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="side-hours"
                label="Studio hours each week, while employed"
                hint="Eight is the plan. About a quarter of that disappears to context switching, and the math treats it that way."
                suffix="hrs"
                value={numbers.studioHoursPerWeek}
                onChange={(value) => setNumbers({ studioHoursPerWeek: value })}
                step={0.5}
              />
              <NumberField
                id="side-projects"
                label="Builds per month, while employed"
                hint="0.5 is one site every two months. That is a sane pace next to a full-time job."
                value={numbers.projectsPerMonthSide}
                onChange={(value) => setNumbers({ projectsPerMonthSide: value })}
                step={0.1}
              />
              <NumberField
                id="full-hours"
                label="Billable hours each week, after you leave"
                hint="Twenty-four leaves room for sales and admin. Forty billable hours is a fantasy with no pipeline."
                suffix="hrs"
                value={numbers.fullTimeBillableHours}
                onChange={(value) => setNumbers({ fullTimeBillableHours: value })}
              />
              <NumberField
                id="full-projects"
                label="Builds per month, full time"
                hint="What you believe you can sell, not what the calendar can physically hold."
                value={numbers.projectsPerMonthFull}
                onChange={(value) => setNumbers({ projectsPerMonthFull: value })}
                step={0.1}
              />
            </div>
          </section>

          <section className="space-y-4" aria-labelledby="actuals-heading">
            <h2 id="actuals-heading" className="font-heading text-2xl tracking-tight">
              What the studio has actually collected
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Deposits and final invoices that landed, including care plans. The income gate opens when all three months clear {money(math.grossTarget)}.
            </p>
            {numbers.recentRevenue.every((amount) => amount === 0) ? (
              <p className="rounded-xl bg-muted px-4 py-3 text-sm leading-6">
                No studio income is recorded yet. The gate stays shut until three months are filled in.
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              {months.map((label, index) => (
                <NumberField
                  key={label}
                  id={`revenue-${index}`}
                  label={label}
                  prefix="$"
                  value={numbers.recentRevenue[index]}
                  onChange={(value) => {
                    const recent = [...numbers.recentRevenue] as [number, number, number]
                    recent[index] = value
                    setNumbers({ recentRevenue: recent })
                  }}
                  step={100}
                />
              ))}
            </div>
            <NumberField
              id="weeks"
              label="Weeks of paid work already signed"
              hint={
                sixWeeks > 0
                  ? `Six weeks at the full-time pace you entered is about ${money(sixWeeks)} of project and retainer revenue.`
                  : "Set a price and a full-time pace to see what six weeks is worth."
              }
              suffix="wks"
              value={numbers.weeksBooked}
              onChange={(value) => setNumbers({ weeksBooked: value })}
              step={0.5}
            />
          </section>
        </div>

        <aside className="order-1 lg:sticky lg:top-20 lg:order-2">
          <div className="rounded-xl bg-card px-4 py-5 ring-1 ring-foreground/10 sm:px-5">
            <p className="text-xs tracking-[0.16em] text-muted-foreground uppercase">Quit number</p>
            <p className="mt-2 font-heading text-5xl tracking-tight">{money(math.quitNumber)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Collected each month to support that, after studio costs and a {oneDecimal(numbers.taxBufferPct)}% buffer:{" "}
              <span className="font-medium text-foreground">{money(math.grossTarget)}</span>
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <dt className="text-xs text-muted-foreground">Job, per hour</dt>
                <dd className="mt-1 font-heading text-2xl">{money(math.dayJobHourly)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Package, per hour</dt>
                <dd className="mt-1 font-heading text-2xl">{money(math.packageHourly)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {math.packageHourly <= 0
                ? "Set a price and the hours it takes before this comparison means anything."
                : hourlyGap > 0
                  ? `An hour inside this package is worth more than an hour of take-home from the job, before the tax buffer. It counts only if the project sells and the hours stay near ${oneDecimal(numbers.hoursPerProject)}.`
                  : `An hour inside this package is worth ${money(math.packageHourly)} before tax, against ${money(math.dayJobHourly)} of take-home from the job. Raise the price or cut the hours before you take the work.`}
            </p>

            <div className="mt-5 space-y-3 border-t border-border pt-4 text-sm leading-6">
              <p>
                <span className="font-medium">Side hustle. </span>
                {money(math.sideRevenue)} collected, about {money(math.sideKept)} kept. Runway: {formatMonths(math.monthsToRunway)}.
              </p>
              {math.sideOverCapacity ? (
                <p className="rounded-lg bg-ember-soft px-3 py-2" role="status">
                  That pace needs {oneDecimal(math.sideHoursNeeded)} hours a month. After a workday you have about {oneDecimal(math.sideHoursAvailable)} billable hours. Lower the project count or the hours inside each one.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Delivery fits the week: {oneDecimal(math.sideHoursNeeded)} hours needed, about {oneDecimal(math.sideHoursAvailable)} billable.
                </p>
              )}
              <p>
                <span className="font-medium">Full time. </span>
                {money(math.fullRevenue)} collected, about {money(math.fullKept)} kept.
              </p>
              <p className={cn(math.fullShortfall > 0 ? "text-primary" : "text-moss")}>
                {math.fullShortfall > 0
                  ? `${money(math.fullShortfall)} short of the quit number each month at this pace.`
                  : "The full-time pace covers the quit number."}
              </p>
              {math.projectsNeeded !== null ? (
                <p className="text-muted-foreground">
                  The quit number wants about {oneDecimal(math.projectsNeeded)} builds a month
                  {numbers.monthlyRetainers > 0
                    ? ` once ${money(numbers.monthlyRetainers)} of retainers is counted`
                    : ""}
                  . You entered {oneDecimal(numbers.projectsPerMonthFull)}.
                </p>
              ) : null}
              {math.fullOverCapacity ? (
                <p className="rounded-lg bg-ember-soft px-3 py-2" role="status">
                  The full-time pace you entered needs {oneDecimal(math.fullHoursNeeded)} hours and you set aside {oneDecimal(math.fullHoursAvailable)}. The calendar is the constraint.
                </p>
              ) : null}
            </div>

            <div className="mt-5">
              <GateList math={math} numbers={numbers} />
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-4 text-sm">
              <Link href="/#leave" className="text-primary underline underline-offset-4">
                Coverage is a task in the last phase
              </Link>
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
