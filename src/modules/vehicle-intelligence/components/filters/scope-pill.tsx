import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/modules/vehicle-intelligence/components/ui/select'

/** Pill "Rótulo **valor** ▾" que abre a lista de opções. */
export function ScopePill({
  label,
  value,
  display,
  items,
  onChange,
  disabled,
}: {
  label: string
  value: string
  display: string
  items: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        size="sm"
        className="event-scope-pill"
        aria-label={`${label}: ${display}`}
      >
        <span>{label}</span>
        <b>{display}</b>
      </SelectTrigger>
      <SelectContent position="popper" align="start" sideOffset={6}>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
