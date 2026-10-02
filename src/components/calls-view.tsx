"use client"

import { useStudio } from "@/components/studio-provider"
import { Button } from "@/components/ui/button"
import {
  callCheckedOn,
  callProspects,
  groupLabels,
  lookedFine,
  type CallGroup,
  type CallProspect,
} from "@/lib/call-list"
import { todayISO } from "@/lib/format"
import { cn } from "@/lib/utils"
import { useState } from "react"

const groups: Array<CallGroup | "all"> = ["all", "week", "domain", "phone"]

const filterLabel: Record<CallGroup | "all", string> = {
  all: "All",
  week: "This week",
  domain: "Dead links",
  phone: "Phone path",
}

export function CallsView() {
  const { state, addLead } = useStudio()
  const [filter, setFilter] = useState<CallGroup | "all">("week")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)

  const visible = callProspects.filter((item) => filter === "all" || item.group === filter)

  function alreadyListed(name: string) {
    return state.leads.some((lead) => lead.business.toLowerCase() === name.toLowerCase())
  }

  function addProspect(item: CallProspect) {
    if (alreadyListed(item.name)) return
    addLead({
      contact: "",
      business: item.name,
      stage: "new",
      value: 0,
      nextStep: "Call with the note",
      due: todayISO(),
    })
  }

  async function copyOpener(item: CallProspect) {
    try {
      await navigator.clipboard.writeText(item.opener)
      setCopiedId(item.id)
      setCopyError(null)
    } catch {
      setCopiedId(null)
      setCopyError(item.id)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Youngsville, LA</p>
      <h1 className="mt-3 font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        Twenty-two calls, from sites checked on {callCheckedOn}.
      </h1>
      <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
        <p>
          These names come from the City of Youngsville business directory. I opened the website listed for each one. The five at the top are the calls where a customer on a phone gets stuck in a way you can describe in one sentence.
        </p>
        <p>
          Look at the page yourself before you dial. A site can change overnight, and a dead domain sometimes means the business moved, not that it closed. Latch does not know who answers the phone.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter the call list">
        {groups.map((group) => {
          const count =
            group === "all"
              ? callProspects.length
              : callProspects.filter((item) => item.group === group).length
          const selected = filter === group
          return (
            <Button
              key={group}
              type="button"
              variant={selected ? "default" : "outline"}
              aria-pressed={selected}
              onClick={() => setFilter(group)}
            >
              {filterLabel[group]} · {count}
            </Button>
          )
        })}
      </div>

      <ol className="mt-8 space-y-5">
        {visible.map((item, index) => {
          const listed = alreadyListed(item.name)
          return (
            <li key={item.id} className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {groupLabels[item.group]}
                  {filter === "all" ? "" : ` · ${index + 1}`}
                </p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </div>
              <h2 className="mt-1 font-heading text-2xl tracking-tight">{item.name}</h2>
              <p className="mt-2 text-sm leading-6">
                <a className="text-primary underline underline-offset-4" href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}>
                  {item.phone}
                </a>
                <span className="text-muted-foreground"> · {item.address}</span>
              </p>
              <p className="mt-1 text-sm">
                <a
                  className="break-all text-muted-foreground underline underline-offset-4"
                  href={item.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.website.replace(/^https?:\/\//, "")}
                </a>
              </p>
              <div className="mt-4 space-y-3 text-sm leading-6">
                <p>
                  <span className="font-medium">What the site does. </span>
                  {item.saw}
                </p>
                <p>
                  <span className="font-medium">The fix. </span>
                  {item.fix}
                </p>
              </div>
              <blockquote className="mt-4 border-l-2 border-primary pl-3 text-sm leading-6 text-muted-foreground">
                {item.opener}
              </blockquote>
              {copyError === item.id ? (
                <p className="mt-2 text-sm text-primary" role="alert">
                  Copy failed. Select the note and copy it yourself.
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => copyOpener(item)}>
                  {copiedId === item.id ? "Copied" : "Copy the opener"}
                </Button>
                <Button type="button" onClick={() => addProspect(item)} disabled={listed}>
                  {listed ? "On your list" : "Add to this week"}
                </Button>
              </div>
            </li>
          )
        })}
      </ol>

      <section className="mt-12" aria-labelledby="skip-heading">
        <h2 id="skip-heading" className="font-heading text-2xl tracking-tight">
          Opened, and already reachable
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These loaded with a phone link, an order path, or a booking button. They are not this week’s calls. A closer look could still find a smaller fault.
        </p>
        <ul className={cn("mt-4 space-y-1 text-sm leading-6")}>
          {lookedFine.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
