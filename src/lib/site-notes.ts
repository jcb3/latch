import type { CallGroup, CallProspect } from "@/lib/call-list"

export type SiteEvidence = {
  name: string
  category: string
  phone: string
  address: string
  website: string
  finalUrl: string | null
  ok: boolean
  status: number | null
  reason: string | null
  https: boolean
  title: string
  hasTel: boolean
  hasViewport: boolean
  placeholder: string | null
  host: string
  finalHost: string | null
  excerpt: string
}

export type SiteReading = {
  group: CallGroup | "fine"
  saw: string
  fix: string
  opener: string
}

const PLACEHOLDERS: RegExp[] = [
  /your custom text here/i,
  /lorem ipsum/i,
  /under construction/i,
  /coming soon/i,
  /under maintenance/i,
  /be back soon/i,
]

export function bareHost(host: string) {
  return host.replace(/^www\./i, "").toLowerCase()
}

export function quotedPlaceholder(html: string): string | null {
  for (const pattern of PLACEHOLDERS) {
    const match = html.match(pattern)
    if (match) return match[0]
  }
  return null
}

export function readHtml(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? decodeBasic(titleMatch[1].replace(/\s+/g, " ").trim()) : ""
  const hasTel = /href\s*=\s*["']tel:/i.test(html)
  const hasViewport = /width\s*=\s*device-width/i.test(html)
  const placeholder = quotedPlaceholder(html)
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
  const excerpt = decodeBasic(withoutScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).slice(
    0,
    700,
  )
  return { title, hasTel, hasViewport, placeholder, excerpt }
}

function decodeBasic(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

export function describeSite(site: SiteEvidence): SiteReading {
  const host = bareHost(site.host)
  const faults: string[] = []
  const fixes: string[] = []

  if (!site.ok && site.status === null && site.reason === "the connection failed") {
    const number = site.phone ? ` The listing shows ${site.phone}.` : ""
    return {
      group: "week",
      saw: `Latch could not open ${host} from this browser.${number} The map still lists ${site.name}.`,
      fix: `Open ${host} before you dial. If the page is down, that is the call. If it loads, check that the number is a tel link.`,
      opener: site.phone
        ? `I found ${site.name} at ${host}. I could not open the page from here. The number on the listing is ${site.phone}.`
        : `I found ${site.name} at ${host}. I could not open the page from here, and the listing has no phone number.`,
    }
  }

  if (!site.ok || (site.status !== null && site.status >= 400)) {
    const saw =
      site.status === 404
        ? `${host} returns a 404. The domain still answers, and the page does not.`
        : site.status !== null && site.status >= 400
          ? `${host} answered with status ${site.status}, so a customer never sees ${site.name}.`
          : `${host} does not load${site.reason ? ` (${site.reason})` : ""}.`
    return {
      group: "domain",
      saw,
      fix: `Publish a page with ${site.address}, hours, and a tap-to-call button, or take the dead address off the listing.`,
      opener: `${host} doesn’t open ${site.name}.`,
    }
  }

  const drifted =
    site.finalHost !== null && bareHost(site.finalHost) !== host && !excerptMentions(site, site.name)
  if (drifted && site.finalHost) {
    return {
      group: "domain",
      saw: `${host} sends the browser to ${bareHost(site.finalHost)}, and that page does not show ${site.name}.`,
      fix: `Point ${host} at a page you control, with the address and a tel link, or replace the listing.`,
      opener: `${host}, the site listed for ${site.name}, doesn’t show the business.`,
    }
  }

  if (site.placeholder) {
    faults.push(`The page still contains “${site.placeholder}.”`)
    fixes.push(`Replace “${site.placeholder}” with the real offer, hours, and address.`)
  }
  if (!site.https) {
    faults.push("The site is still plain http.")
    fixes.push("Turn on HTTPS.")
  }
  if (!site.title) {
    faults.push("The page has no title tag, so the browser tab and search results have nothing to show.")
    fixes.push(`Add a title: ${site.name} in ${placeFromAddress(site.address)}.`)
  }
  if (!site.hasViewport) {
    faults.push("The mobile viewport tag leaves out width=device-width.")
    fixes.push("Set the viewport to width=device-width.")
  }
  if (!site.hasTel) {
    faults.push(
      site.phone
        ? `There is no tel link. The number ${site.phone} does not dial when someone taps the page.`
        : "The page has no phone number and no tel link.",
    )
    fixes.push(
      site.phone
        ? `Make ${site.phone} a tel link in the header.`
        : "Put a tap-to-call number in the header.",
    )
  }

  if (faults.length === 0) {
    return {
      group: "fine",
      saw: "",
      fix: "",
      opener: "",
    }
  }

  const week =
    Boolean(site.placeholder) || !site.https || !site.title || (!site.hasViewport && !site.hasTel)
  const group: CallGroup = week || !site.phone ? "week" : "phone"
  const lead = faults[0] ?? ""
  const opener = openerFor(site, host, lead)

  return {
    group,
    saw: faults.join(" "),
    fix: fixes.join(" "),
    opener,
  }
}

function excerptMentions(site: SiteEvidence, name: string) {
  const haystack = `${site.title} ${site.excerpt}`.toLowerCase()
  const needle = name.toLowerCase().split(/\s+/).slice(0, 2).join(" ")
  return needle.length > 2 && haystack.includes(needle)
}

function placeFromAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim())
  return parts.length >= 2 ? parts.slice(-2).join(", ") : address
}

function openerFor(site: SiteEvidence, host: string, lead: string) {
  if (site.placeholder) {
    return `I was on ${host}. The page still says “${site.placeholder}.”`
  }
  if (!site.hasTel && site.phone) {
    return `I opened ${host}. The number ${site.phone} doesn’t dial when you tap it.`
  }
  if (!site.https) {
    return `${host} is still plain http.`
  }
  if (!site.title) {
    return `${host} loads, and the page has no title, so search results have to guess what ${site.name} is.`
  }
  return `I opened ${host}. ${lead}`
}

export function prospectsFromSites(sites: SiteEvidence[]): {
  prospects: CallProspect[]
  lookedFine: string[]
} {
  const used = new Set<string>()
  const prospects: CallProspect[] = []
  const lookedFine: string[] = []
  for (const site of sites) {
    const reading = describeSite(site)
    if (reading.group === "fine") {
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
      group: reading.group,
      saw: reading.saw,
      fix: reading.fix,
      opener: reading.opener,
    })
  }
  prospects.sort((a, b) => groupRank(a.group) - groupRank(b.group))
  return { prospects, lookedFine }
}

function groupRank(group: CallGroup) {
  if (group === "week") return 0
  if (group === "domain") return 1
  return 2
}

export function uniqueSlug(name: string, used: Set<string>) {
  const base =
    name
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "call"
  let id = base
  let n = 2
  while (used.has(id)) id = `${base}-${n++}`
  used.add(id)
  return id
}
