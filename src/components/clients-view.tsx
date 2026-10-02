"use client"

import { LoadingBlock } from "@/components/loading-block"
import { NumberField } from "@/components/number-field"
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
import { Textarea } from "@/components/ui/textarea"
import { defaultNiche, defaultOffer, isStage } from "@/lib/defaults"
import { money } from "@/lib/format"
import { stageItems, stageLabels } from "@/lib/stages"
import type { Lead, Stage } from "@/lib/types"
import { useMemo, useState, type FormEvent } from "react"

const emptyLead = {
  contact: "",
  business: "",
  stage: "new" as Stage,
  value: 0,
  nextStep: "",
  due: "",
}

export function ClientsView() {
  const { ready, state, setPositioning, setPackage, addLead, updateLead, removeLead } =
    useStudio()
  const [draft, setDraft] = useState(emptyLead)
  const [formError, setFormError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")

  const note = useMemo(() => outreachNote(state.offer), [state.offer])
  const signed = state.leads.filter((lead) => lead.stage === "won")
  const proposed = state.leads.filter((lead) => lead.stage === "proposal" || lead.stage === "won")
  const pipelineValue = proposed.reduce((sum, lead) => sum + lead.value, 0)

  if (!ready) return <LoadingBlock label="Opening your clients…" />

  const example = state.niche === defaultNiche && state.offer === defaultOffer

  function submitLead(event: FormEvent) {
    event.preventDefault()
    if (!draft.contact.trim() && !draft.business.trim()) {
      setFormError("Add a person or a business. A list of thirty starts with one real name.")
      return
    }
    addLead({
      contact: draft.contact.trim(),
      business: draft.business.trim(),
      stage: draft.stage,
      value: draft.value,
      nextStep: draft.nextStep.trim(),
      due: draft.due,
    })
    setDraft(emptyLead)
    setFormError(null)
  }

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note)
      setCopyState("copied")
    } catch {
      setCopyState("failed")
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">Who pays you</p>
      <h1 className="mt-3 max-w-2xl font-heading text-4xl leading-[1.05] tracking-tight sm:text-5xl">
        One buyer, three prices, and a list of thirty.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
        The first sales job is not a brand. It is a sentence someone else can repeat, a price you will say out loud, and thirty businesses with one specific thing wrong on their site.
      </p>

      {example ? (
        <p className="mt-6 max-w-2xl rounded-xl bg-ember-soft px-4 py-3 text-sm leading-6">
          The clinic offer is a starting example. Rewrite it for the buyer you actually want. The packages below are sample prices for local-service sites, not a quote for your market.
        </p>
      ) : null}

      <section className="mt-10 grid gap-4" aria-labelledby="offer-heading">
        <h2 id="offer-heading" className="font-heading text-2xl tracking-tight">
          The offer
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="niche">Who you serve</Label>
          <Input
            id="niche"
            value={state.niche}
            autoComplete="off"
            onChange={(event) => setPositioning({ niche: event.target.value })}
            className="h-10 bg-card"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="offer">The sentence</Label>
          <p className="text-xs leading-5 text-muted-foreground">
            I build a specific thing for that buyer so they get a specific result.
          </p>
          <Textarea
            id="offer"
            value={state.offer}
            onChange={(event) => setPositioning({ offer: event.target.value })}
            className="min-h-24 bg-card"
          />
        </div>
      </section>

      <section className="mt-10" aria-labelledby="packages-heading">
        <h2 id="packages-heading" className="font-heading text-2xl tracking-tight">
          Three packages
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          The middle one is the offer. The small one makes the middle feel reasonable. Care is monthly, and it belongs in retainer income on the Numbers page once someone is paying it.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {state.packages.map((item) => (
            <form
              key={item.id}
              className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="space-y-1.5">
                <Label htmlFor={`${item.id}-name`}>Name</Label>
                <Input
                  id={`${item.id}-name`}
                  value={item.name}
                  onChange={(event) => setPackage(item.id, { name: event.target.value })}
                  className="h-10 bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  id={`${item.id}-price`}
                  label={item.id === "care" ? "Monthly price" : "Price"}
                  prefix="$"
                  value={item.price}
                  onChange={(value) => setPackage(item.id, { price: value })}
                  step={50}
                />
                <div className="space-y-1.5">
                  <Label htmlFor={`${item.id}-cadence`}>Timing</Label>
                  <Input
                    id={`${item.id}-cadence`}
                    value={item.cadence}
                    onChange={(event) => setPackage(item.id, { cadence: event.target.value })}
                    className="h-10 bg-background"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${item.id}-summary`}>What they are buying</Label>
                <Textarea
                  id={`${item.id}-summary`}
                  value={item.summary}
                  onChange={(event) => setPackage(item.id, { summary: event.target.value })}
                  className="min-h-28 bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${item.id}-includes`}>Included, one line each</Label>
                <Textarea
                  id={`${item.id}-includes`}
                  value={item.includes}
                  onChange={(event) => setPackage(item.id, { includes: event.target.value })}
                  className="min-h-28 bg-background"
                />
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {item.includes
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => (
                    <li key={line}>· {line}</li>
                  ))}
              </ul>
            </form>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="note-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="note-heading" className="font-heading text-2xl tracking-tight">
            The first note
          </h2>
          <Button type="button" variant="outline" onClick={copyNote}>
            {copyState === "copied" ? "Copied" : "Copy the note"}
          </Button>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Five of these a week. Replace the bracketed line with something you saw on their site. Leave the calendar link out until they answer.
        </p>
        {copyState === "failed" ? (
          <p className="mt-3 text-sm text-primary" role="alert">
            Copy failed. Select the note and copy it yourself.
          </p>
        ) : null}
        <pre className="mt-4 overflow-x-auto rounded-xl bg-card p-4 text-sm leading-6 whitespace-pre-wrap ring-1 ring-foreground/10">
          {note}
        </pre>
      </section>

      <section className="mt-10" aria-labelledby="pipeline-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="pipeline-heading" className="font-heading text-2xl tracking-tight">
            The list
          </h2>
          <p className="text-sm text-muted-foreground">
            {state.leads.length} names · {signed.length} signed · {money(pipelineValue)} in play
          </p>
        </div>

        <form
          onSubmit={submitLead}
          className="mt-4 grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="lead-contact">Person</Label>
            <Input
              id="lead-contact"
              value={draft.contact}
              autoComplete="off"
              onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))}
              className="h-10 bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-business">Business</Label>
            <Input
              id="lead-business"
              value={draft.business}
              autoComplete="off"
              onChange={(event) => setDraft((current) => ({ ...current, business: event.target.value }))}
              className="h-10 bg-background"
            />
          </div>
          <NumberField
            id="lead-value"
            label="Value, if you know it"
            prefix="$"
            value={draft.value}
            onChange={(value) => setDraft((current) => ({ ...current, value }))}
            step={100}
          />
          <div className="space-y-1.5">
            <Label htmlFor="lead-due">Next step date</Label>
            <Input
              id="lead-due"
              type="date"
              value={draft.due}
              onChange={(event) => setDraft((current) => ({ ...current, due: event.target.value }))}
              className="h-10 bg-background"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="lead-next">Next step</Label>
            <Input
              id="lead-next"
              value={draft.nextStep}
              placeholder="Send the one-page outline"
              onChange={(event) => setDraft((current) => ({ ...current, nextStep: event.target.value }))}
              className="h-10 bg-background"
            />
          </div>
          {formError ? (
            <p className="text-sm text-primary sm:col-span-2" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit">Add to the list</Button>
          </div>
        </form>

        {state.leads.length === 0 ? (
          <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm leading-6">
            No one is on the list yet. Add the first business here, or keep the thirty in a notebook and check the task on the plan when the list exists.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {state.leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                onChange={(patch) => updateLead(lead.id, patch)}
                onRemove={() => removeLead(lead.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function LeadRow({
  lead,
  onChange,
  onRemove,
}: {
  lead: Lead
  onChange: (patch: Partial<Lead>) => void
  onRemove: () => void
}) {
  return (
    <li className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium">{lead.contact || "Unnamed"}</p>
          <p className="text-sm text-muted-foreground">{lead.business || "No business name"}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          Remove
        </Button>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${lead.id}-stage`}>Stage</Label>
          <Select
            items={stageItems}
            value={lead.stage}
            onValueChange={(value) => {
              if (isStage(value)) onChange({ stage: value })
            }}
          >
            <SelectTrigger id={`${lead.id}-stage`} className="w-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NumberField
          id={`${lead.id}-value`}
          label="Value"
          prefix="$"
          value={lead.value}
          onChange={(value) => onChange({ value })}
          step={100}
        />
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor={`${lead.id}-due`}>Next step date</Label>
          <Input
            id={`${lead.id}-due`}
            type="date"
            value={lead.due}
            onChange={(event) => onChange({ due: event.target.value })}
            className="h-10 bg-background"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <Label htmlFor={`${lead.id}-next`}>Next step</Label>
          <Input
            id={`${lead.id}-next`}
            value={lead.nextStep}
            onChange={(event) => onChange({ nextStep: event.target.value })}
            className="h-10 bg-background"
          />
        </div>
      </div>
      <p className="sr-only">{stageLabels[lead.stage]}</p>
    </li>
  )
}

function outreachNote(offer: string) {
  const sentence = offer.trim() || "I build straightforward marketing sites for local businesses."
  return `Subject: Your site on a phone

Hi {first name},

I was on {business}'s site on my phone. [One specific thing: a button that does nothing, hours that are hard to find, a menu that never opens.]

${sentence}

If it's useful, I can send a one-page outline of what I'd change. No call required.

{your name}`
}
