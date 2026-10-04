"use client"

import { defaultState, mergeState } from "@/lib/defaults"
import type { GatheredCalls, Lead, Numbers, PackageOffer, StudioState } from "@/lib/types"
import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"

const STORAGE_KEY = "latch-studio-v1"

type Snapshot = {
  state: StudioState
  storageError: string | null
}

type StudioContextValue = {
  storageError: string | null
  state: StudioState
  setNumbers: (patch: Partial<Numbers>) => void
  toggleTask: (id: string, checked: boolean) => void
  setPositioning: (patch: { niche?: string; offer?: string }) => void
  setPackage: (id: string, patch: Partial<PackageOffer>) => void
  addLead: (lead: Omit<Lead, "id">) => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  removeLead: (id: string) => void
  setGatheredCalls: (calls: GatheredCalls) => void
  clearGatheredCalls: () => void
  reset: () => void
}

const StudioContext = createContext<StudioContextValue | null>(null)

const serverSnapshot: Snapshot = { state: defaultState, storageError: null }

let snapshot: Snapshot = serverSnapshot
let loaded = false
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    snapshot = { state: mergeState(JSON.parse(raw)), storageError: null }
  } catch {
    snapshot = {
      state: defaultState,
      storageError:
        "This browser blocked the saved plan. You can keep reading, and changes may not stick.",
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  ensureLoaded()
  return snapshot
}

function getServerSnapshot() {
  return serverSnapshot
}

function write(next: StudioState, storageError = snapshot.storageError) {
  let error = storageError
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    if (error?.startsWith("The plan could not be saved")) error = null
  } catch {
    error = "The plan could not be saved in this browser. It will last until you refresh."
  }
  snapshot = { state: next, storageError: error }
  emit()
}

function patchState(recipe: (current: StudioState) => StudioState) {
  write(recipe(snapshot.state))
}

function cleanNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

function sanitizeNumbers(patch: Partial<Numbers>): Partial<Numbers> {
  const next: Partial<Numbers> = { ...patch }
  const keys = Object.keys(next) as (keyof Numbers)[]
  for (const key of keys) {
    if (key === "recentRevenue") continue
    const value = next[key]
    if (typeof value !== "number") continue
    const clean = cleanNumber(value)
    if (key === "taxBufferPct") next.taxBufferPct = Math.min(80, clean)
    else next[key] = clean as never
  }
  if (patch.recentRevenue) {
    next.recentRevenue = [
      cleanNumber(patch.recentRevenue[0] ?? 0),
      cleanNumber(patch.recentRevenue[1] ?? 0),
      cleanNumber(patch.recentRevenue[2] ?? 0),
    ]
  }
  return next
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const value = useMemo<StudioContextValue>(
    () => ({
      storageError: snap.storageError,
      state: snap.state,
      setNumbers: (patch) => {
        const safe = sanitizeNumbers(patch)
        patchState((current) => ({
          ...current,
          numbers: { ...current.numbers, ...safe },
        }))
      },
      toggleTask: (id, checked) => {
        patchState((current) => ({
          ...current,
          checked: { ...current.checked, [id]: checked },
        }))
      },
      setPositioning: (patch) => {
        patchState((current) => ({ ...current, ...patch }))
      },
      setPackage: (id, patch) => {
        const next = { ...patch }
        if (typeof next.price === "number") next.price = cleanNumber(next.price)
        patchState((current) => ({
          ...current,
          packages: current.packages.map((item) =>
            item.id === id ? { ...item, ...next } : item,
          ),
        }))
      },
      addLead: (lead) => {
        const id =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `lead-${Date.now()}`
        patchState((current) => ({
          ...current,
          leads: [{ ...lead, id, value: cleanNumber(lead.value) }, ...current.leads],
        }))
      },
      updateLead: (id, patch) => {
        const next = { ...patch }
        if (typeof next.value === "number") next.value = cleanNumber(next.value)
        patchState((current) => ({
          ...current,
          leads: current.leads.map((lead) => (lead.id === id ? { ...lead, ...next } : lead)),
        }))
      },
      removeLead: (id) => {
        patchState((current) => ({
          ...current,
          leads: current.leads.filter((lead) => lead.id !== id),
        }))
      },
      setGatheredCalls: (calls) => {
        patchState((current) => ({ ...current, gatheredCalls: calls }))
      },
      clearGatheredCalls: () => {
        patchState((current) => ({ ...current, gatheredCalls: null }))
      },
      reset: () => {
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          snapshot = {
            state: defaultState,
            storageError: "The saved plan could not be erased. Refresh the page and try again.",
          }
          emit()
          return
        }
        write(defaultState, null)
      },
    }),
    [snap],
  )

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
}

export function useStudio() {
  const value = useContext(StudioContext)
  if (!value) throw new Error("useStudio must be used within StudioProvider")
  return value
}
