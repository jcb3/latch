"use client"

import { useStudio } from "@/components/studio-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

const links = [
  { href: "/", label: "Plan" },
  { href: "/numbers", label: "Numbers" },
  { href: "/clients", label: "Clients" },
]

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { reset, storageError } = useStudio()
  const [armReset, setArmReset] = useState(false)

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="h-1 bg-primary" />
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <Link href="/" className="group rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="font-heading text-[1.7rem] leading-none tracking-tight">Latch</span>
            <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
              A web studio you can start after work
            </span>
          </Link>
          <nav aria-label="Sections" className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "text-foreground shadow-[inset_0_-2px_0_0_var(--primary)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      {storageError ? (
        <div className="border-b border-border bg-ember-soft" role="alert">
          <p className="mx-auto w-full max-w-5xl px-5 py-3 text-sm text-foreground sm:px-6">
            {storageError}
          </p>
        </div>
      ) : null}
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:px-6">
          <p className="max-w-2xl leading-6">
            Saved in this browser only. Latch is a planning tool for a side studio. It is not legal, tax, or financial advice. A CPA and, if your employment agreement is unclear, an employment attorney should set the real terms.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!armReset) {
                  setArmReset(true)
                  return
                }
                reset()
                setArmReset(false)
              }}
            >
              {armReset ? "Erase the saved plan" : "Reset this browser’s copy"}
            </Button>
            {armReset ? (
              <button
                type="button"
                className="text-sm text-foreground underline underline-offset-4"
                onClick={() => setArmReset(false)}
              >
                Keep it
              </button>
            ) : null}
          </div>
          {armReset ? (
            <p role="status">
              This removes the checklist, the numbers, and the pipeline stored on this browser.
            </p>
          ) : null}
        </div>
      </footer>
    </div>
  )
}
