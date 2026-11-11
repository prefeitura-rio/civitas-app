export type GraphFilterTab = 'fatos' | 'placas'

export function FilterTabs({
  tab,
  onChange,
  factCount,
  plateCount,
}: {
  tab: GraphFilterTab
  onChange: (tab: GraphFilterTab) => void
  factCount: number
  plateCount: number
}) {
  return (
    <div
      className="graph-filter-tabs"
      role="tablist"
      aria-label="Grupos de filtros"
    >
      {(['fatos', 'placas'] as const).map((name) => {
        const badge = name === 'fatos' ? factCount : plateCount
        return (
          <button
            key={name}
            type="button"
            id={`graph-tab-${name}`}
            role="tab"
            aria-selected={tab === name}
            aria-controls={`graph-tabpanel-${name}`}
            tabIndex={tab === name ? 0 : -1}
            onClick={() => onChange(name)}
            onKeyDown={(event) => {
              if (
                ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
              ) {
                event.preventDefault()
                const next =
                  event.key === 'Home'
                    ? 'fatos'
                    : event.key === 'End'
                      ? 'placas'
                      : name === 'fatos'
                        ? 'placas'
                        : 'fatos'
                onChange(next)
                document.getElementById(`graph-tab-${next}`)?.focus()
              }
            }}
          >
            {name === 'fatos' ? 'Fatos' : 'Placas'}
            {badge > 0 && <span>{badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
