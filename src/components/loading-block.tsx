export function LoadingBlock({ label }: { label: string }) {
  return (
    <div
      className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="font-heading text-3xl text-foreground">{label}</p>
      <div className="mt-8 space-y-3">
        <div className="h-4 w-2/3 rounded-md bg-muted" />
        <div className="h-4 w-full rounded-md bg-muted" />
        <div className="h-4 w-5/6 rounded-md bg-muted" />
        <div className="mt-8 h-24 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
