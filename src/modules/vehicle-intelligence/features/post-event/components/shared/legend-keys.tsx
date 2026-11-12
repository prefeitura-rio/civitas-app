import { ChevronDown, ChevronUp, Layers3 } from 'lucide-react'

/** A linha da legenda do mapa: as duas modalidades de origem, desconexão, conexão e o botão "Como ler". */
export function LegendKeys({
  primaryLabel,
  secondaryLabel,
  open,
  onToggle,
}: {
  primaryLabel: string
  secondaryLabel: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="map-legend-keys">
      <span>
        <i className="origin robbery" />
        {primaryLabel}
      </span>
      <span>
        <i className="origin theft" />
        {secondaryLabel}
      </span>
      <span>
        <i className="destination" />
        Desconexão
      </span>
      <span>
        <i className="flow-line" />
        Conexão
      </span>
      <button
        type="button"
        className="map-legend-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        <Layers3 size={13} />
        Como ler{open ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
      </button>
    </div>
  )
}
