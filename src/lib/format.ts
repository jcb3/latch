export function money(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatMonths(months: number | null): string {
  if (months === null) return "not moving at this pace"
  if (months <= 0.05) return "already funded"
  if (months < 1) return "less than a month"
  const rounded = Math.round(months * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${text} ${rounded === 1 ? "month" : "months"}`
}

export function oneDecimal(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function todayISO(): string {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}
