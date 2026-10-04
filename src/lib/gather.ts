import { askArbiter, applyArbiterDrafts, type ArbiterSettings } from "@/lib/arbiter"
import { prospectsFromSites, quotedPlaceholder, readHtml, type SiteEvidence } from "@/lib/site-notes"
import type { GatheredCalls } from "@/lib/types"
import { stateByCode } from "@/lib/us-states"

const FETCH_LIMIT = 8
const AROUND_METERS = 12_000
const USER_AGENT = "Latch/1.0 (local web studio call research)"

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "yelp.com",
  "google.com",
  "goo.gl",
  "youtube.com",
  "linkedin.com",
  "linktr.ee",
  "nextdoor.com",
  "yellowpages.com",
  "mapquest.com",
  "tripadvisor.com",
  "apple.com",
]

const CHAIN_HOSTS = [
  "mcdonalds.com",
  "subway.com",
  "dollargeneral.com",
  "walmart.com",
  "starbucks.com",
  "tacobell.com",
  "sonicdrivein.com",
  "dominos.com",
  "pizzahut.com",
  "wendys.com",
  "burgerking.com",
  "chick-fil-a.com",
  "popeyes.com",
  "kfc.com",
  "arbys.com",
  "dairyqueen.com",
  "wafflehouse.com",
  "ihop.com",
  "chipotle.com",
  "panerabread.com",
  "dunkindonuts.com",
  "dunkin.com",
  "valero.com",
  "shell.com",
  "exxon.com",
  "chevron.com",
  "anytimefitness.com",
  "planetfitness.com",
  "cvs.com",
  "walgreens.com",
  "homedepot.com",
  "lowes.com",
  "target.com",
  "costco.com",
  "autozone.com",
  "oreillyauto.com",
  "advanceautoparts.com",
  "att.com",
  "verizon.com",
  "t-mobile.com",
]

export class GatherError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.name = "GatherError"
    this.status = status
  }
}

export function parseGatherRequest(body: unknown):
  | { ok: true; city: string; state: string }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Choose a city and a state." }
  }
  const raw = body as { city?: unknown; state?: unknown }
  const city = typeof raw.city === "string" ? raw.city.trim().replace(/\s+/g, " ") : ""
  const state = typeof raw.state === "string" ? raw.state.trim().toUpperCase() : ""
  if (!city || !state) return { ok: false, error: "Choose a city and a state." }
  if (city.length < 2 || city.length > 60 || !/^[A-Za-z][A-Za-z .'-]*$/.test(city)) {
    return { ok: false, error: "Enter a city name, then choose a state." }
  }
  if (!stateByCode(state)) return { ok: false, error: "Choose a state." }
  return { ok: true, city, state }
}

export function normalizeWebsite(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 300) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withProtocol)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (!url.hostname.includes(".")) return null
    url.hash = ""
    return url.toString()
  } catch {
    return null
  }
}

export function isPrivateAddress(address: string) {
  const host = address.toLowerCase().replace(/^\[|\]$/g, "")
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return true
  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true
  }
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!match) return false
  const octets = match.slice(1).map(Number)
  if (octets.some((octet) => octet > 255)) return true
  const [a, b] = octets
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  return false
}

export async function isPublicWebsite(raw: string) {
  const normalized = normalizeWebsite(raw)
  if (!normalized) return null
  const url = new URL(normalized)
  if (isPrivateAddress(url.hostname)) return null
  if (hostIn(url.hostname, SOCIAL_HOSTS)) return null
  return normalized
}

function hostIn(hostname: string, list: string[]) {
  const host = hostname.toLowerCase().replace(/^www\./, "")
  return list.some((item) => host === item || host.endsWith(`.${item}`))
}

function loose(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

function samePlace(left: string, right: string) {
  const a = loose(left)
  const b = loose(right)
  return a === b || a.startsWith(b) || b.startsWith(a)
}

type Place = {
  lat: string
  lon: string
  name?: string
  display_name: string
  address?: Record<string, string>
}

function cityMatches(city: string, place: Place) {
  const query = loose(city)
  const fields = [
    place.name,
    place.address?.city,
    place.address?.town,
    place.address?.village,
    place.address?.hamlet,
    place.address?.municipality,
  ]
  return fields.some((field) => {
    if (!field) return false
    const value = loose(field)
    return value === query || value.startsWith(query) || query.startsWith(value)
  })
}

export function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, "")
  const local = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  if (local.length !== 10) return raw.trim()
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

function categoryFrom(tags: Record<string, string>) {
  const raw =
    tags.shop ||
    tags.amenity ||
    tags.office ||
    tags.craft ||
    tags.tourism ||
    tags.leisure ||
    tags.healthcare ||
    "local business"
  return raw.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function addressFrom(tags: Record<string, string>, city: string, state: string) {
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ")
  const locality = tags["addr:city"] || city
  const postcode = tags["addr:postcode"]
  return [street, [locality, state].filter(Boolean).join(", "), postcode].filter(Boolean).join(", ")
}

type Candidate = {
  name: string
  category: string
  phone: string
  address: string
  website: string
  chain: boolean
}

async function readJson(response: Response) {
  const text = await response.text()
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new GatherError("The map search didn't answer. Try again in a minute.")
  }
}

export async function fetchWithRetry(
  fetchImpl: typeof fetch,
  input: Parameters<typeof fetch>[0],
  init: Parameters<typeof fetch>[1],
) {
  let last: Response | null = null
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchImpl(input, init)
      if (response.status !== 429 && response.status !== 503 && response.status !== 504) return response
      last = response
    } catch {
      // A dropped map request gets the same retry as a busy one.
    }
    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
  }
  if (!last) throw new GatherError("The map search didn't answer. Try again in a minute.")
  return last
}

async function geocode(city: string, stateName: string, fetchImpl: typeof fetch): Promise<Place> {
  const url = new URL("https://nominatim.openstreetmap.org/search")
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("limit", "1")
  url.searchParams.set("countrycodes", "us")
  url.searchParams.set("q", `${city}, ${stateName}, USA`)
  const response = await fetchWithRetry(fetchImpl, url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  })
  if (!response.ok) throw new GatherError("The map search didn't answer. Try again in a minute.")
  const places = (await readJson(response)) as Place[]
  const place = places[0]
  if (!place?.lat || !place.lon) {
    throw new GatherError(`No place named ${city}, ${stateName} turned up.`, 404)
  }
  const foundState = place.address?.state ?? ""
  if (loose(foundState) !== loose(stateName)) {
    throw new GatherError(`No place named ${city} turned up in ${stateName}.`, 404)
  }
  if (!cityMatches(city, place)) {
    throw new GatherError(`No place named ${city} turned up in ${stateName}.`, 404)
  }
  return place
}

async function findCandidates(
  place: Place,
  city: string,
  state: string,
  fetchImpl: typeof fetch,
): Promise<Candidate[]> {
  const query = `[out:json][timeout:25];
(
  nwr["name"]["website"](around:${AROUND_METERS},${place.lat},${place.lon});
  nwr["name"]["contact:website"](around:${AROUND_METERS},${place.lat},${place.lon});
);
out tags 40;`
  const response = await fetchWithRetry(fetchImpl, "https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "User-Agent": USER_AGENT, "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new GatherError("The map search didn't answer. Try again in a minute.")
  const payload = (await readJson(response)) as {
    elements?: Array<{ tags?: Record<string, string> }>
  }
  const seen = new Set<string>()
  const candidates: Candidate[] = []
  for (const element of payload.elements ?? []) {
    const tags = element.tags
    if (!tags?.name) continue
    const listedCity = tags["addr:city"]
    if (listedCity && !samePlace(listedCity, city)) continue
    const website = await isPublicWebsite(tags.website || tags["contact:website"] || "")
    if (!website) continue
    const host = new URL(website).hostname
    const key = `${host}|${loose(tags.name)}`
    if (seen.has(key)) continue
    seen.add(key)
    candidates.push({
      name: tags.name.trim(),
      category: categoryFrom(tags),
      phone: formatPhone(tags.phone || tags["contact:phone"] || ""),
      address: addressFrom(tags, city, state),
      website,
      chain: hostIn(host, CHAIN_HOSTS),
    })
  }
  candidates.sort((a, b) => Number(a.chain) - Number(b.chain) || Number(!a.phone) - Number(!b.phone))
  return candidates
}

function listedHost(website: string) {
  try {
    return new URL(website).hostname
  } catch {
    return ""
  }
}

function evidenceFrom(
  candidate: Candidate,
  current: string,
  status: number | null,
  reason: string | null,
  html: string,
): SiteEvidence {
  const reading = readHtml(html)
  let finalHost: string | null = null
  try {
    finalHost = new URL(current).hostname
  } catch {
    finalHost = null
  }
  const ok = status !== null && status < 400 && !reason && html.length > 0
  return {
    name: candidate.name,
    category: candidate.category,
    phone: candidate.phone,
    address: candidate.address,
    website: candidate.website,
    finalUrl: ok ? current : null,
    ok,
    status,
    reason,
    https: current.startsWith("https://"),
    title: reading.title,
    hasTel: reading.hasTel,
    hasViewport: reading.hasViewport,
    placeholder: reading.placeholder ?? (html ? quotedPlaceholder(html) : null),
    host: listedHost(candidate.website),
    finalHost,
    excerpt: reading.excerpt,
  }
}

function blockedResponse(response: Response) {
  return response.type === "opaque" || response.type === "opaqueredirect" || response.status === 0
}

async function readDirect(
  candidate: Candidate,
  fetchImpl: typeof fetch,
): Promise<SiteEvidence | null> {
  let current = candidate.website
  let status: number | null = null
  let reason: string | null = null
  let html = ""
  for (let hop = 0; hop < 4; hop += 1) {
    const allowed = await isPublicWebsite(current)
    if (!allowed) {
      return evidenceFrom(candidate, current, null, "the address is not a public website", "")
    }
    current = allowed
    let response: Response
    try {
      response = await fetchImpl(current, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
        redirect: "manual",
        signal: AbortSignal.timeout(8_000),
      })
    } catch {
      return null
    }
    if (blockedResponse(response)) return null
    status = response.status
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location")
      if (!location) {
        reason = "a redirect went nowhere"
        break
      }
      current = new URL(location, current).toString()
      continue
    }
    if (response.status >= 400) break
    html = await response.text().then((text) => text.slice(0, 350_000)).catch(() => "")
    break
  }
  return evidenceFrom(candidate, current, status, reason, html)
}

async function readViaProxy(candidate: Candidate, fetchImpl: typeof fetch): Promise<SiteEvidence> {
  const proxy = new URL("https://api.allorigins.win/get")
  proxy.searchParams.set("url", candidate.website)
  try {
    const response = await fetchImpl(proxy, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    })
    if (!response.ok || blockedResponse(response)) {
      return evidenceFrom(candidate, candidate.website, null, "the connection failed", "")
    }
    const payload = (await response.json()) as {
      contents?: unknown
      status?: { url?: unknown; http_code?: unknown }
    }
    const html = typeof payload.contents === "string" ? payload.contents.slice(0, 350_000) : ""
    const status = typeof payload.status?.http_code === "number" ? payload.status.http_code : null
    const finalUrl =
      typeof payload.status?.url === "string" && payload.status.url ? payload.status.url : candidate.website
    const allowed = await isPublicWebsite(finalUrl)
    if (!allowed) {
      return evidenceFrom(candidate, candidate.website, null, "the address is not a public website", "")
    }
    if (!html) {
      return evidenceFrom(candidate, allowed, status, status !== null && status < 400 ? "the connection failed" : null, "")
    }
    return evidenceFrom(candidate, allowed, status ?? 200, null, html)
  } catch {
    return evidenceFrom(candidate, candidate.website, null, "the connection failed", "")
  }
}

async function readWebsite(candidate: Candidate, fetchImpl: typeof fetch): Promise<SiteEvidence> {
  const allowed = await isPublicWebsite(candidate.website)
  if (!allowed) {
    return evidenceFrom(candidate, candidate.website, null, "the address is not a public website", "")
  }
  const direct = await readDirect({ ...candidate, website: allowed }, fetchImpl)
  if (direct && (direct.ok || direct.reason || (direct.status !== null && direct.status >= 400))) {
    return direct
  }
  return readViaProxy({ ...candidate, website: allowed }, fetchImpl)
}

export function openListedSite(
  input: { name: string; category: string; phone: string; address: string; website: string },
  fetchImpl: typeof fetch,
) {
  return readWebsite({ ...input, chain: false }, fetchImpl)
}

export async function gatherCalls(
  city: string,
  stateCode: string,
  fetchImpl: typeof fetch = fetch,
  settings?: ArbiterSettings,
): Promise<GatheredCalls> {
  const state = stateByCode(stateCode)
  if (!state) throw new GatherError("Choose a state.", 400)
  const place = await geocode(city, state.name, fetchImpl)
  const candidates = await findCandidates(place, city, state.code, fetchImpl)
  if (candidates.length === 0) {
    throw new GatherError(`No business websites turned up for ${city}, ${state.name}.`, 404)
  }
  const local = candidates.filter((item) => !item.chain)
  const toOpen = (local.length >= 3 ? local : candidates).slice(0, FETCH_LIMIT)
  const sites = await mapPool(toOpen, 4, (candidate) => readWebsite(candidate, fetchImpl))
  const skippedChains = candidates
    .filter((item) => item.chain && !toOpen.includes(item))
    .slice(0, 8)
    .map((item) => `${item.name} (national site)`)
  const arbiter = await askArbiter(sites, settings)
  const applied = arbiter.drafts ? applyArbiterDrafts(sites, arbiter.drafts) : null
  const localNotes = prospectsFromSites(sites)
  const notes = applied ?? { prospects: localNotes.prospects, lookedFine: localNotes.lookedFine }
  const checkedOn = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date())
  return {
    city,
    state: state.code,
    stateName: state.name,
    checkedOn,
    via: applied ? "arbiter" : "pages",
    arbiterNote: applied
      ? arbiter.note
      : arbiter.drafts
        ? "Arbiter's notes didn't match the sites Latch opened, so Latch kept its own reading."
        : arbiter.note,
    prospects: notes.prospects,
    lookedFine: [...notes.lookedFine, ...skippedChains],
  }
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      results[index] = await fn(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}
