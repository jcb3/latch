import type { CallGroup, CallProspect } from "@/lib/call-list"
import {
  bareHost,
  describeSite,
  type SiteEvidence,
  uniqueSlug,
} from "@/lib/site-notes"

export type ArbiterDraft = {
  website: string
  group?: string
  saw?: string
  fix?: string
  opener?: string
}

const GROUPS: readonly CallGroup[] = ["week", "domain", "phone"]

export type ArbiterSettings = {
  baseUrl?: string
  apiKey?: string
  model?: string
}

export function arbiterConfigured(settings?: ArbiterSettings) {
  const baseUrl = settings?.baseUrl ?? process.env.ARBITER_BASE_URL
  return Boolean(baseUrl?.trim())
}

export function parseArbiterContent(content: string): ArbiterDraft[] | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = (fenced?.[1] ?? content).trim()
  const objectAt = raw.indexOf("{")
  const arrayAt = raw.indexOf("[")
  const start =
    objectAt === -1 ? arrayAt : arrayAt === -1 ? objectAt : Math.min(objectAt, arrayAt)
  if (start < 0) return null
  const slice = raw.slice(start)
  const end = slice.trimStart().startsWith("[") ? slice.lastIndexOf("]") : slice.lastIndexOf("}")
  if (end < 0) return null
  let data: unknown
  try {
    data = JSON.parse(slice.slice(0, end + 1))
  } catch {
    return null
  }
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? ((data as { prospects?: unknown; calls?: unknown }).prospects ??
        (data as { calls?: unknown }).calls)
      : null
  if (!Array.isArray(list)) return null
  return list.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const rawItem = item as Partial<ArbiterDraft>
    if (typeof rawItem.website !== "string" || !rawItem.website.trim()) return []
    return [
      {
        website: rawItem.website,
        group: typeof rawItem.group === "string" ? rawItem.group : undefined,
        saw: typeof rawItem.saw === "string" ? rawItem.saw.trim() : undefined,
        fix: typeof rawItem.fix === "string" ? rawItem.fix.trim() : undefined,
        opener: typeof rawItem.opener === "string" ? rawItem.opener.trim() : undefined,
      },
    ]
  })
}

function sameSite(website: string, site: SiteEvidence) {
  try {
    const host = bareHost(new URL(website).hostname)
    return host === bareHost(site.host) || (site.finalHost !== null && host === bareHost(site.finalHost))
  } catch {
    return false
  }
}

function usableDraft(draft: ArbiterDraft | undefined): draft is ArbiterDraft & {
  saw: string
  fix: string
  opener: string
} {
  return Boolean(
    draft &&
      draft.saw &&
      draft.fix &&
      draft.opener &&
      draft.saw.length > 20 &&
      draft.fix.length > 10 &&
      draft.opener.length > 10,
  )
}

export function applyArbiterDrafts(
  sites: SiteEvidence[],
  drafts: ArbiterDraft[],
): { prospects: CallProspect[]; lookedFine: string[]; usedArbiter: boolean } | null {
  const matches = sites.filter((site) => drafts.some((draft) => sameSite(draft.website, site)))
  if (matches.length === 0) return null
  const used = new Set<string>()
  const prospects: CallProspect[] = []
  const lookedFine: string[] = []
  let usedArbiter = false
  for (const site of sites) {
    const draft = drafts.find((item) => sameSite(item.website, site))
    const local = describeSite(site)
    if (usableDraft(draft) && GROUPS.includes(draft.group as CallGroup)) {
      usedArbiter = true
      prospects.push({
        id: uniqueSlug(site.name, used),
        name: site.name,
        category: site.category,
        phone: site.phone || "No number listed",
        address: site.address,
        website: site.finalUrl || site.website,
        group: draft.group as CallGroup,
        saw: draft.saw,
        fix: draft.fix,
        opener: draft.opener,
      })
      continue
    }
    if (draft?.group === "fine" || (!draft && local.group === "fine")) {
      lookedFine.push(site.name)
      continue
    }
    if (local.group === "fine") {
      lookedFine.push(site.name)
      continue
    }
    prospects.push({
      id: uniqueSlug(site.name, used),
      name: site.name,
      category: site.category,
      phone: site.phone || "No number listed",
      address: site.address,
      website: site.finalUrl || site.website,
      group: local.group,
      saw: local.saw,
      fix: local.fix,
      opener: local.opener,
    })
  }
  if (!usedArbiter) return null
  return { prospects, lookedFine, usedArbiter }
}

export async function askArbiter(
  sites: SiteEvidence[],
  settings?: ArbiterSettings,
): Promise<{
  drafts: ArbiterDraft[] | null
  note: string
}> {
  const baseUrl = (settings?.baseUrl ?? process.env.ARBITER_BASE_URL ?? "").trim().replace(/\/$/, "")
  if (!baseUrl) {
    return {
      drafts: null,
      note: "Arbiter is not configured, so Latch wrote the notes from the pages it opened.",
    }
  }
  const model = (settings?.model ?? process.env.ARBITER_MODEL ?? "").trim() || "auto"
  const apiKey = (settings?.apiKey ?? process.env.ARBITER_API_KEY ?? "").trim()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  const evidence = sites.map((site) => ({
    name: site.name,
    category: site.category,
    phone: site.phone,
    address: site.address,
    website: site.website,
    finalUrl: site.finalUrl,
    ok: site.ok,
    status: site.status,
    reason: site.reason,
    https: site.https,
    title: site.title,
    hasTel: site.hasTel,
    hasViewport: site.hasViewport,
    placeholder: site.placeholder,
    host: site.host,
    excerpt: site.excerpt.slice(0, 500),
  }))
  let response: Response
  try {
    response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You write outreach notes for a one-person web studio. Use only the evidence JSON. Do not invent businesses, phone numbers, or faults that are not in that evidence. Return JSON with a prospects array. Each prospect has website, group, saw, fix, and opener. group is week (a phone customer gets stuck in one specific way), domain (the listed site does not reach the business), or phone (the site is up and the number does not dial). Skip sites that already have HTTPS, a title, and a tel link. saw, fix, and opener must name the real hostname or the real fault.",
          },
          { role: "user", content: JSON.stringify({ prospects: evidence }) },
        ],
      }),
      signal: AbortSignal.timeout(25_000),
    })
  } catch {
    return {
      drafts: null,
      note: "Arbiter didn't answer. Latch wrote the notes from the pages it opened.",
    }
  }
  if (!response.ok) {
    return {
      drafts: null,
      note: `Arbiter returned ${response.status}. Latch wrote the notes from the pages it opened.`,
    }
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    return {
      drafts: null,
      note: "Arbiter returned notes Latch couldn't read. Latch kept the reading from the pages it opened.",
    }
  }
  const content = completionText(payload)
  const drafts = content ? parseArbiterContent(content) : null
  if (!drafts || drafts.length === 0) {
    return {
      drafts: null,
      note: "Arbiter returned notes Latch couldn't use. Latch kept the reading from the pages it opened.",
    }
  }
  const routed = headerValue(response, "x-arbiter-provider") || headerValue(response, "x-provider")
  const usedModel =
    payload && typeof payload === "object" && typeof (payload as { model?: unknown }).model === "string"
      ? (payload as { model: string }).model
      : model
  const route = routed ? `${usedModel} via ${routed}` : usedModel
  return {
    drafts,
    note: `Arbiter wrote these notes (${route}).`,
  }
}

function completionText(payload: unknown) {
  if (!payload || typeof payload !== "object") return ""
  const choices = (payload as { choices?: unknown }).choices
  if (!Array.isArray(choices) || !choices[0] || typeof choices[0] !== "object") return ""
  const message = (choices[0] as { message?: { content?: unknown } }).message
  return typeof message?.content === "string" ? message.content : ""
}

function headerValue(response: Response, name: string) {
  return response.headers.get(name)?.trim() || ""
}
