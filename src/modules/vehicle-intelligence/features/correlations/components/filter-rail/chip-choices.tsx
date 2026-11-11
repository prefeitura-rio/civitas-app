export function ChipChoices({
  id,
  options,
  selected,
  onChange,
  labelFor,
}: {
  id: string
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
  labelFor: (value: string) => string
}) {
  return (
    <div
      id={id}
      className="graph-filter-chips"
      role="group"
      aria-labelledby={`${id}-label`}
    >
      <button
        type="button"
        aria-pressed={!selected.length}
        onClick={() => onChange([])}
      >
        Todos
      </button>
      {options.map((item) => (
        <button
          type="button"
          key={item}
          aria-pressed={selected.includes(item)}
          onClick={() =>
            onChange(
              selected.includes(item)
                ? selected.filter((value) => value !== item)
                : [...selected, item],
            )
          }
        >
          {labelFor(item)}
        </button>
      ))}
    </div>
  )
}
