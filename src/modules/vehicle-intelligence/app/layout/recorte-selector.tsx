import {
  recorteAtual,
  type RecorteId,
  RECORTES,
  switchRecorte,
} from '@/modules/vehicle-intelligence/config/recortes'

/** Alternador segmentado de recortes no cabeçalho. */
export function RecorteSelector() {
  return (
    <div className="recorte-switcher">
      <span className="recorte-switcher-label">Recorte</span>
      <div
        className="recorte-segments"
        role="group"
        aria-label="Selecionar recorte"
      >
        {RECORTES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === recorteAtual ? 'active' : ''}
            aria-pressed={item.id === recorteAtual}
            onClick={() => switchRecorte(item.id as RecorteId)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
