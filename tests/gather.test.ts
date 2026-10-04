import assert from "node:assert/strict"
import { createServer } from "node:http"
import { test } from "node:test"
import { applyArbiterDrafts, askArbiter, parseArbiterContent } from "../src/lib/arbiter.ts"
import { fetchWithRetry, isPrivateAddress, normalizeWebsite, openListedSite, parseGatherRequest } from "../src/lib/gather.ts"
import { describeSite, prospectsFromSites, type SiteEvidence } from "../src/lib/site-notes.ts"
import { mergeState } from "../src/lib/defaults.ts"

function site(patch: Partial<SiteEvidence> = {}): SiteEvidence {
  return {
    name: "Amelie Aesthetics Studio",
    category: "Clinic",
    phone: "(337) 856-7995",
    address: "205 Prescott Boulevard, Youngsville, LA 70592",
    website: "http://www.amelieaesthetics.com",
    finalUrl: "http://www.amelieaesthetics.com",
    ok: true,
    status: 200,
    reason: null,
    https: false,
    title: "Amelie",
    hasTel: false,
    hasViewport: false,
    placeholder: "Your Custom Text Here",
    host: "www.amelieaesthetics.com",
    finalHost: "www.amelieaesthetics.com",
    excerpt: "Your Custom Text Here",
    ...patch,
  }
}

test("a busy map search is tried again", async () => {
  let calls = 0
  const response = await fetchWithRetry(
    async () => {
      calls += 1
      return new Response("busy", { status: calls < 3 ? 429 : 200 })
    },
    "https://example.test",
    {},
  )
  assert.equal(calls, 3)
  assert.equal(response.status, 200)
})

test("gather requires both a city and a state", () => {
  assert.equal(parseGatherRequest({}).ok, false)
  assert.equal(parseGatherRequest({ city: "Youngsville" }).ok, false)
  assert.equal(parseGatherRequest({ state: "LA" }).ok, false)
  assert.equal(parseGatherRequest({ city: "Youngsville", state: "ZZ" }).ok, false)
  const parsed = parseGatherRequest({ city: "  Youngsville ", state: "la" })
  assert.equal(parsed.ok, true)
  if (parsed.ok) {
    assert.equal(parsed.city, "Youngsville")
    assert.equal(parsed.state, "LA")
  }
})

test("private and social websites are not opened", () => {
  assert.equal(isPrivateAddress("127.0.0.1"), true)
  assert.equal(isPrivateAddress("10.1.2.3"), true)
  assert.equal(isPrivateAddress("192.168.1.9"), true)
  assert.equal(isPrivateAddress("8.8.8.8"), false)
  assert.equal(normalizeWebsite("http://127.0.0.1/admin"), "http://127.0.0.1/admin")
  assert.equal(normalizeWebsite("javascript:alert(1)"), null)
  assert.equal(normalizeWebsite("www.example.com/path"), "https://www.example.com/path")
})

test("a placeholder on plain http becomes a call you can say out loud", () => {
  const reading = describeSite(site())
  assert.equal(reading.group, "week")
  assert.match(reading.saw, /Your Custom Text Here/)
  assert.match(reading.saw, /plain http/)
  assert.match(reading.opener, /amelieaesthetics.com/)
  assert.match(reading.opener, /Your Custom Text Here/)
})

test("a live site whose number does not dial is a phone-path call", () => {
  const reading = describeSite(
    site({
      https: true,
      title: "Cypress Health",
      hasViewport: true,
      placeholder: null,
      hasTel: false,
      website: "https://www.cypresshealthclinic.com",
      finalUrl: "https://www.cypresshealthclinic.com",
      host: "www.cypresshealthclinic.com",
      finalHost: "www.cypresshealthclinic.com",
    }),
  )
  assert.equal(reading.group, "phone")
  assert.match(reading.saw, /tel link/)
  assert.match(reading.opener, /337/)
})

test("a page the browser could not open stays a call, with the listed number", () => {
  const reading = describeSite(
    site({
      ok: false,
      status: null,
      reason: "the connection failed",
      finalUrl: null,
      https: false,
      placeholder: null,
      host: "cabinetsplusllc.com",
      finalHost: null,
      website: "http://www.cabinetsplusllc.com",
    }),
  )
  assert.equal(reading.group, "week")
  assert.match(reading.saw, /could not open/)
  assert.match(reading.opener, /cabinetsplusllc.com/)
  assert.match(reading.opener, /337/)
})

test("a site that answers 404 is a dead-link call", () => {
  const reading = describeSite(
    site({
      ok: false,
      status: 404,
      reason: null,
      finalUrl: null,
      https: true,
      placeholder: null,
      host: "cabinetsplusllc.com",
      finalHost: null,
      website: "https://cabinetsplusllc.com",
    }),
  )
  assert.equal(reading.group, "domain")
  assert.match(reading.saw, /404/)
  assert.match(reading.opener, /cabinetsplusllc.com/)
})

test("https with a title and a tel link is not a call", () => {
  const { prospects, lookedFine } = prospectsFromSites([
    site({
      https: true,
      hasTel: true,
      hasViewport: true,
      placeholder: null,
      title: "Gallery of Granite",
      name: "Gallery of Granite",
    }),
  ])
  assert.equal(prospects.length, 0)
  assert.deepEqual(lookedFine, ["Gallery of Granite"])
})

test("Arbiter notes are kept only when they name a site Latch opened", () => {
  const opened = site({
    https: true,
    hasViewport: true,
    placeholder: null,
    hasTel: false,
    title: "Cypress Health",
    website: "https://www.cypresshealthclinic.com/",
    host: "www.cypresshealthclinic.com",
    finalHost: "www.cypresshealthclinic.com",
  })
  const parsed = parseArbiterContent(
    '```json\n{"prospects":[{"website":"https://www.cypresshealthclinic.com/","group":"phone","saw":"The clinic number is styled text, not a tel link.","fix":"Wrap 337.450.3047 in a tel link.","opener":"On cypresshealthclinic.com the number does not dial."},{"website":"https://evil.example/","group":"week","saw":"Invented fault that is long enough to pass.","fix":"Invented fix for a site Latch never opened.","opener":"Invented opener should be dropped."}]}\n```',
  )
  assert.ok(parsed)
  const applied = applyArbiterDrafts([opened], parsed ?? [])
  assert.ok(applied)
  assert.equal(applied?.prospects.length, 1)
  assert.equal(applied?.prospects[0]?.name, "Amelie Aesthetics Studio")
  assert.match(applied?.prospects[0]?.opener ?? "", /cypresshealthclinic/)
  assert.equal(applied?.prospects[0]?.phone, "(337) 856-7995")
})

test("Latch posts opened sites to Arbiter's chat completions route", async () => {
  const seen: { authorization: string | undefined; model: string; website: string } = {
    authorization: undefined,
    model: "",
    website: "",
  }
  const server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const body = JSON.parse(Buffer.concat(chunks).toString()) as {
        model: string
        messages: Array<{ content: string }>
      }
      seen.authorization = req.headers.authorization
      seen.model = body.model
      seen.website = JSON.parse(body.messages[1]?.content ?? "{}").prospects[0].website
      res.setHeader("content-type", "application/json")
      res.setHeader("x-arbiter-provider", "spare-quota")
      res.end(
        JSON.stringify({
          model: "auto",
          choices: [
            {
              message: {
                content: JSON.stringify({
                  prospects: [
                    {
                      website: "https://www.cypresshealthclinic.com/",
                      group: "phone",
                      saw: "The clinic number is styled text, not a tel link on the page.",
                      fix: "Wrap the number in a tel link in the header.",
                      opener: "On cypresshealthclinic.com the number does not dial.",
                    },
                  ],
                }),
              },
            },
          ],
        }),
      )
    })
  })
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const address = server.address()
  if (!address || typeof address === "string") throw new Error("no port")
  process.env.ARBITER_BASE_URL = `http://127.0.0.1:${address.port}`
  process.env.ARBITER_API_KEY = "test-key"
  process.env.ARBITER_MODEL = "auto"
  try {
    const result = await askArbiter([
      site({
        https: true,
        hasViewport: true,
        placeholder: null,
        hasTel: false,
        title: "Cypress Health",
        website: "https://www.cypresshealthclinic.com/",
        host: "www.cypresshealthclinic.com",
        finalHost: "www.cypresshealthclinic.com",
      }),
    ])
    assert.equal(seen.authorization, "Bearer test-key")
    assert.equal(seen.model, "auto")
    assert.equal(seen.website, "https://www.cypresshealthclinic.com/")
    assert.match(result.note, /spare-quota/)
    const applied = applyArbiterDrafts(
      [
        site({
          https: true,
          hasViewport: true,
          placeholder: null,
          hasTel: false,
          title: "Cypress Health",
          name: "Cypress Health",
          phone: "(337) 450-3047",
          website: "https://www.cypresshealthclinic.com/",
          host: "www.cypresshealthclinic.com",
          finalHost: "www.cypresshealthclinic.com",
        }),
      ],
      result.drafts ?? [],
    )
    assert.equal(applied?.prospects[0]?.phone, "(337) 450-3047")
    assert.match(applied?.prospects[0]?.opener ?? "", /cypresshealthclinic/)
  } finally {
    delete process.env.ARBITER_BASE_URL
    delete process.env.ARBITER_API_KEY
    delete process.env.ARBITER_MODEL
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
  }
})

test("a page the browser cannot read is opened through the public page proxy", async () => {
  const html =
    "<!doctype html><html><head><title>Mel</title></head><body>Your Custom Text Here</body></html>"
  const urls: string[] = []
  const evidence = await openListedSite(
    {
      name: "Mel's Diner",
      category: "Restaurant",
      phone: "(337) 555-0100",
      address: "Youngsville, LA",
      website: "http://melsdiner.example/",
    },
    async (input) => {
      const url = String(input)
      urls.push(url)
      if (url.startsWith("http://melsdiner.example")) throw new Error("cors")
      return new Response(
        JSON.stringify({
          contents: html,
          status: { url: "http://melsdiner.example/", http_code: 200, content_type: "text/html" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
    },
  )
  assert.deepEqual(urls, [
    "http://melsdiner.example/",
    "https://api.allorigins.win/get?url=http%3A%2F%2Fmelsdiner.example%2F",
  ])
  assert.equal(evidence.ok, true)
  assert.equal(evidence.title, "Mel")
  assert.equal(evidence.placeholder, "Your Custom Text Here")
  assert.equal(describeSite(evidence).group, "week")
})

test("a private address is never sent to the page proxy", async () => {
  let calls = 0
  const evidence = await openListedSite(
    {
      name: "Router",
      category: "Office",
      phone: "",
      address: "Local",
      website: "http://127.0.0.1/admin",
    },
    async () => {
      calls += 1
      return new Response("nope", { status: 200 })
    },
  )
  assert.equal(calls, 0)
  assert.equal(evidence.ok, false)
  assert.match(evidence.reason ?? "", /not a public website/)
})

test("a saved gather survives a reload", () => {
  const merged = mergeState({
    gatheredCalls: {
      city: "Youngsville",
      state: "LA",
      stateName: "Louisiana",
      checkedOn: "October 3, 2026",
      via: "pages",
      arbiterNote: "Arbiter is not configured.",
      prospects: [
        {
          id: "amelie",
          name: "Amelie",
          category: "Clinic",
          phone: "(337) 856-7995",
          address: "Youngsville, LA",
          website: "http://amelie.example",
          group: "week",
          saw: "The page still says placeholder text in the hero.",
          fix: "Replace it.",
          opener: "The page still says placeholder text.",
        },
      ],
      lookedFine: ["Blue Apache"],
    },
  })
  assert.equal(merged.gatheredCalls?.city, "Youngsville")
  assert.equal(merged.gatheredCalls?.prospects.length, 1)
})
