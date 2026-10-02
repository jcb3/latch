"use client"

import { GateList } from "@/components/gate-list"
import { useStudio } from "@/components/studio-provider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { compute } from "@/lib/calc"
import { todayISO } from "@/lib/format"
import { allTasks, phases, rules, week } from "@/lib/plan-data"
import { stageLabels } from "@/lib/stages"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMemo, useState } from "react"

export function PlanView() {
  const { state, toggleTask } = useStudio()
  const [remainingOnly, setRemainingOnly] = useState(false)
  const math = useMemo(
    () => compute(state.numbers, Boolean(state.checked.coverage)),
    [state.checked.coverage, state.numbers],
  )

  const done = allTasks.filter((task) => state.checked[task.id]).length
  const next = allTasks.find((task) => !state.checked[task.id])
  const today = todayISO()
  const followUps = state.leads.filter(
    (lead) =>
      lead.due &&
      lead.due <= today &&
      lead.stage !== "won" &&
      lead.stage !== "passed",
  )

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
        Side studio, then the job
      </p>
      <h1 className="mt-3 max-w-xl font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        Start the studio after work. Leave when the numbers say you can.
      </h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
        <p>
          The sequence is ordinary on purpose. Read the employment agreement, pick one kind of buyer, price three packages, and keep a single build open while the job is still paying you. Eight hours a week is the schedule. Sunday is off.
        </p>
        <p>
          The Numbers page turns your expenses into a quit number. The Clients page holds the offer and the list of thirty. Nothing here is a substitute for a CPA, or for an employment attorney if your contract is unclear.
        </p>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-border py-4">
        <div>
          <dt className="text-xs tracking-wide text-muted-foreground uppercase">Tasks</dt>
          <dd className="mt-1 font-heading text-2xl">
            {done}
            <span className="text-base text-muted-foreground"> / {allTasks.length}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted-foreground uppercase">Gates open</dt>
          <dd className="mt-1 font-heading text-2xl">
            {math.gatesMet}
            <span className="text-base text-muted-foreground"> / 4</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs tracking-wide text-muted-foreground uppercase">Hours</dt>
          <dd className="mt-1 font-heading text-2xl">
            {state.numbers.studioHoursPerWeek}
            <span className="text-base text-muted-foreground"> / wk</span>
          </dd>
        </div>
      </dl>

      <section className="mt-10" aria-labelledby="rules-heading">
        <h2 id="rules-heading" className="font-heading text-2xl tracking-tight">
          Five rules
        </h2>
        <ol className="mt-4 divide-y divide-border border-y border-border">
          {rules.map((rule, index) => (
            <li key={rule.title} className="grid gap-1 py-4 sm:grid-cols-[2rem_1fr] sm:gap-4">
              <span className="font-heading text-lg text-primary">{index + 1}</span>
              <span>
                <span className="block font-medium">{rule.title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {rule.detail}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10 rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10 sm:px-5" aria-labelledby="week-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="week-heading" className="font-heading text-2xl tracking-tight">
            The week
          </h2>
          {next ? (
            <a href={`#task-${next.id}`} className="text-sm text-primary underline underline-offset-4">
              Next: {next.title}
            </a>
          ) : (
            <p className="text-sm text-moss">Every task is checked.</p>
          )}
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          If the week collapses, keep Saturday and the five notes. Drop a delivery evening before you drop sales.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {week.map((entry) => (
            <li key={entry.day} className="grid gap-1 py-3 sm:grid-cols-[7rem_5.5rem_1fr] sm:gap-3">
              <span className="font-medium">{entry.day}</span>
              <span className="text-sm text-primary">{entry.block}</span>
              <span className="text-sm leading-6 text-muted-foreground">{entry.detail}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-sm font-medium">Follow-ups due</h3>
          {followUps.length === 0 ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              None today. When a lead has a next-step date, it shows up here on that day.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {followUps.map((lead) => (
                <li key={lead.id} className="text-sm leading-6">
                  <Link href="/clients" className="underline underline-offset-4">
                    {lead.contact || lead.business}
                  </Link>
                  <span className="text-muted-foreground">
                    {" "}
                    · {stageLabels[lead.stage]}
                    {lead.nextStep ? ` · ${lead.nextStep}` : ""} · due {lead.due}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl tracking-tight">The work, in order</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRemainingOnly((value) => !value)}
          aria-pressed={remainingOnly}
        >
          {remainingOnly ? "Show the whole plan" : "Show what’s left"}
        </Button>
      </div>

      <div className="mt-6 space-y-12">
        {phases.map((phase) => {
          const phaseDone = phase.tasks.filter((task) => state.checked[task.id]).length
          const visible = remainingOnly
            ? phase.tasks.filter((task) => !state.checked[task.id])
            : phase.tasks
          return (
            <section key={phase.id} aria-labelledby={`phase-${phase.id}`} id={phase.id}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-heading text-sm text-primary">{phase.number}</p>
                  <h3 id={`phase-${phase.id}`} className="font-heading text-3xl tracking-tight">
                    {phase.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{phase.goal}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground tabular-nums">
                  {phaseDone}/{phase.tasks.length}
                </p>
              </div>
              <Progress
                value={(phaseDone / phase.tasks.length) * 100}
                aria-label={`${phase.title}: ${phaseDone} of ${phase.tasks.length} done`}
                className="mt-3"
              />
              {visible.length === 0 ? (
                <p className="mt-4 text-sm text-moss">This phase is checked off.</p>
              ) : (
                <ul className="mt-2">
                  {visible.map((task) => {
                    const checked = Boolean(state.checked[task.id])
                    return (
                      <li key={task.id} id={`task-${task.id}`} className="border-b border-border py-4">
                        <label className="flex cursor-pointer gap-3">
                          <Checkbox
                            className="mt-1"
                            checked={checked}
                            onCheckedChange={(value) => toggleTask(task.id, Boolean(value))}
                          />
                          <span>
                            <span
                              className={cn(
                                "block font-medium",
                                checked && "text-muted-foreground line-through decoration-border",
                              )}
                            >
                              {task.title}
                            </span>
                            <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                              {task.detail}
                            </span>
                            {task.id === "list-30" ? (
                              <span className="mt-2 block text-sm text-foreground">
                                {state.leads.length}{" "}
                                {state.leads.length === 1 ? "name is" : "names are"} in the pipeline.{" "}
                                <Link href="/calls" className="text-primary underline underline-offset-4">
                                  The Youngsville call list
                                </Link>{" "}
                                is the first set, already checked.
                              </span>
                            ) : null}
                          </span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      <section className="mt-12" aria-labelledby="gates-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="gates-heading" className="font-heading text-2xl tracking-tight">
            The quit gates
          </h2>
          <Link href="/numbers" className="text-sm text-primary underline underline-offset-4">
            Edit the numbers
          </Link>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Give notice when all four are open. Until then, the job is what carries the month.
        </p>
        <div className="mt-4">
          <GateList math={math} numbers={state.numbers} />
        </div>
      </section>
    </div>
  )
}
