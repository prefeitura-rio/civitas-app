export function RangeSlider({
  id,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <>
      <div className="graph-filter-range">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <output htmlFor={id}>≥ {value}</output>
      </div>
      <div className="graph-filter-range-scale">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </>
  )
}
