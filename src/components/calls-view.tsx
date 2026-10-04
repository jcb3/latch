"use client"

import { useStudio } from "@/components/studio-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  callCheckedOn,
  callProspects,
  groupLabels,
  preferredCallFilter,
  lookedFine,
  type CallGroup,
  type CallProspect,
} from "@/lib/call-list"
import { todayISO } from "@/lib/format"
import { GatherError, gatherCalls, parseGatherRequest } from "@/lib/gather"
import { US_STATES } from "@/lib/us-states"
import { cn } from "@/lib/utils"
import { useState, useSyncExternalStore, type FormEvent } from "react"

const ARBITER_KEY = "latch-arbiter-v1"

type SavedArbiter = { baseUrl: string; apiKey: string }

const emptyArbiter: SavedArbiter = { baseUrl: "", apiKey: "" }
let arbiterSnapshot: SavedArbiter = emptyArbiter
let arbiterLoaded = false
const arbiterListeners = new Set<() => void>()

function emitArbiter() {
  for (const listener of arbiterListeners) listener()
}

function ensureArbiter() {
  if (arbiterLoaded || typeof window === "undefined") return
  arbiterLoaded = true
  try {
    const saved = JSON.parse(localStorage.getItem(ARBITER_KEY) || "{}") as {
      baseUrl?: unknown
      apiKey?: unknown
    }
    arbiterSnapshot = {
      baseUrl: typeof saved.baseUrl === "string" ? saved.baseUrl : "",
      apiKey: typeof saved.apiKey === "string" ? saved.apiKey : "",
    }
  } catch {
    arbiterSnapshot = emptyArbiter
  }
}

function subscribeArbiter(listener: () => void) {
  arbiterListeners.add(listener)
  return () => arbiterListeners.delete(listener)
}

function getArbiter() {
  ensureArbiter()
  return arbiterSnapshot
}

function setArbiter(patch: Partial<SavedArbiter>) {
  ensureArbiter()
  arbiterSnapshot = { ...arbiterSnapshot, ...patch }
  try {
    localStorage.setItem(ARBITER_KEY, JSON.stringify(arbiterSnapshot))
  } catch {
    // The gather can still use the address typed in this session.
  }
  emitArbiter()
}

const groups: Array<CallGroup | "all"> = ["all", "week", "domain", "phone"]

const filterLabel: Record<CallGroup | "all", string> = {
  all: "All",
  week: "This week",
  domain: "Dead links",
  phone: "Phone path",
}

export function CallsView() {
  const { state, addLead, setGatheredCalls, clearGatheredCalls } = useStudio()
  const [filter, setFilter] = useState<CallGroup | "all">("week")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyError, setCopyError] = useState<string | null>(null)
  const [city, setCity] = useState("")
  const [stateCode, setStateCode] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const arbiter = useSyncExternalStore(subscribeArbiter, getArbiter, () => emptyArbiter)

  const gathered = state.gatheredCalls
  const prospects = gathered?.prospects ?? callProspects
  const fine = gathered?.lookedFine ?? lookedFine
  const visible = prospects.filter((item) => filter === "all" || item.group === filter)
  const ready = city.trim().length > 1 && Boolean(stateCode)

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

  async function onGather(event: FormEvent) {
    event.preventDefault()
    if (!ready || !stateCode || pending) return
    setPending(true)
    setError(null)
    const parsed = parseGatherRequest({ city, state: stateCode })
    if (!parsed.ok) {
      setError(parsed.error)
      setPending(false)
      return
    }
    try {
      const calls = await gatherCalls(parsed.city, parsed.state, fetch, {
        baseUrl: arbiter.baseUrl,
        apiKey: arbiter.apiKey,
      })
      setGatheredCalls(calls)
      setFilter(preferredCallFilter(calls.prospects.map((item) => item.group)))
    } catch (caught) {
      setError(
        caught instanceof GatherError
          ? caught.message
          : "The search didn't finish. Try again in a minute.",
      )
    } finally {
      setPending(false)
    }
  }

  const place = gathered ? `${gathered.city}, ${gathered.state}` : "Youngsville, LA"
  const checkedOn = gathered?.checkedOn || callCheckedOn
  const heading = gathered
    ? prospects.length === 0
      ? `No broken sites in ${gathered.city}, from the pages checked on ${checkedOn}.`
      : `${prospects.length} ${prospects.length === 1 ? "call" : "calls"} in ${gathered.city}, from sites checked on ${checkedOn}.`
    : `Twenty-two calls, from sites checked on ${checkedOn}.`

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">{place}</p>
      <h1 className="mt-3 font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        {heading}
      </h1>
      <div className="mt-5 space-y-4 text-base leading-7 text-muted-foreground">
        {gathered ? (
          <>
            <p>
              These names come from websites mapped to {gathered.city}, {gathered.stateName}. Latch
              opened each local site. {gathered.arbiterNote}
            </p>
            <p>
              Look at the page yourself before you dial. A site can change overnight, and a dead
              domain sometimes means the business moved, not that it closed. Latch does not know who
              answers the phone.
            </p>
          </>
        ) : (
          <>
            <p>
              These names come from the City of Youngsville business directory. I opened the website
              listed for each one. The five at the top are the calls where a customer on a phone
              gets stuck in a way you can describe in one sentence.
            </p>
            <p>
              Look at the page yourself before you dial. A site can change overnight, and a dead
              domain sometimes means the business moved, not that it closed. Latch does not know who
              answers the phone.
            </p>
          </>
        )}
      </div>

      <form
        onSubmit={onGather}
        className="mt-8 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12.5rem] sm:items-end">
          <div>
            <Label htmlFor="gather-city">City</Label>
            <Input
              id="gather-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Youngsville"
              autoComplete="address-level2"
              disabled={pending}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label id="gather-state-label" htmlFor="gather-state">
              State
            </Label>
            <Select
              value={stateCode}
              onValueChange={(value) => setStateCode(value)}
              disabled={pending}
            >
              <SelectTrigger id="gather-state" aria-labelledby="gather-state-label" className="mt-1.5 w-full">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="arbiter-url">Arbiter address</Label>
            <Input
              id="arbiter-url"
              value={arbiter.baseUrl}
              onChange={(event) => setArbiter({ baseUrl: event.target.value })}
              placeholder="https://your-arbiter.example"
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="arbiter-key">Arbiter key</Label>
            <Input
              id="arbiter-key"
              type="password"
              value={arbiter.apiKey}
              onChange={(event) => setArbiter({ apiKey: event.target.value })}
              placeholder="Optional"
              autoComplete="off"
              disabled={pending}
              className="mt-1.5"
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!ready || pending} aria-busy={pending}>
            {pending ? "Gathering calls…" : "Gather calls"}
          </Button>
          {gathered ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                clearGatheredCalls()
                setFilter("week")
              }}
            >
              Show the Youngsville sample
            </Button>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          City and state are both required. Gather calls searches for websites in that place and opens
          them from this browser. Paste the Arbiter address if you want it to write the notes. The
          address and key stay in this browser.
        </p>
        {error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {pending ? (
          <p className="mt-2 text-sm text-muted-foreground" role="status">
            Finding local sites and opening the pages. This can take a minute.
          </p>
        ) : null}
      </form>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter the call list">
        {groups.map((group) => {
          const count =
            group === "all" ? prospects.length : prospects.filter((item) => item.group === group).length
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

      {visible.length === 0 ? (
        <p className="mt-8 text-sm leading-6 text-muted-foreground">
          Nothing in this group. The sites that already have a way to call are listed below.
        </p>
      ) : (
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
                  <a
                    className="text-primary underline underline-offset-4"
                    href={`tel:${item.phone.replace(/[^\d+]/g, "")}`}
                  >
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
      )}

      <section className="mt-12" aria-labelledby="skip-heading">
        <h2 id="skip-heading" className="font-heading text-2xl tracking-tight">
          Opened, and already reachable
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          These loaded with a phone link, an order path, or a booking button, or they are national
          locator pages. They are not this week’s calls. A closer look could still find a smaller
          fault.
        </p>
        <ul className={cn("mt-4 space-y-1 text-sm leading-6")}>
          {fine.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
