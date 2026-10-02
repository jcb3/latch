import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type NumberFieldProps = {
  id: string
  label: string
  hint?: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  max?: number
}

export function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        ) : null}
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          autoComplete="off"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const raw = event.target.value
            if (raw.trim() === "") {
              onChange(0)
              return
            }
            const next = Number(raw)
            onChange(Number.isFinite(next) ? next : 0)
          }}
          className={`h-10 bg-card ${prefix ? "pl-6" : ""} ${suffix ? "pr-12" : ""}`}
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  )
}
