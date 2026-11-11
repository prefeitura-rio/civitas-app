export function SegmentedChoice<T extends string | number>({
  id,
  value,
  choices,
  onChange,
  disabled = false,
}: {
  id: string
  value: T
  choices: Array<[T, string]>
  onChange: (value: T) => void
  disabled?: boolean
}) {
  return (
    <div
      id={id}
      className="graph-filter-seg"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      {choices.map(([item, label]) => (
        <button
          type="button"
          key={item}
          aria-pressed={value === item}
          disabled={disabled}
          onClick={() => onChange(item)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
