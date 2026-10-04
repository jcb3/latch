import assert from "node:assert/strict"
import { test } from "node:test"
import { callProspects, preferredCallFilter } from "../src/lib/call-list.ts"

test("every Youngsville prospect has a phone, a site, and a sentence you can say", () => {
  assert.ok(callProspects.length >= 20)
  const ids = new Set<string>()
  for (const item of callProspects) {
    assert.equal(ids.has(item.id), false)
    ids.add(item.id)
    assert.match(item.phone, /\(337\)/)
    assert.match(item.website, /^https?:\/\//)
    assert.ok(item.saw.length > 40)
    assert.ok(item.fix.length > 20)
    assert.ok(item.opener.length > 20)
    assert.ok(item.address.includes("Youngsville"))
  }
  assert.equal(callProspects.filter((item) => item.group === "week").length, 5)
})

test("a gather opens the first group that has a call", () => {
  assert.equal(preferredCallFilter(["domain", "domain"]), "domain")
  assert.equal(preferredCallFilter(["phone", "week"]), "week")
  assert.equal(preferredCallFilter(["phone"]), "phone")
  assert.equal(preferredCallFilter([]), "all")
})
