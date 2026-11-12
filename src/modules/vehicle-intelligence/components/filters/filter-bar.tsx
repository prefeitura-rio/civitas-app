import { SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

/** A barra: "FILTROS", as pills do recorte e, à direita, os extras e "Limpar" quando há filtro ativo. */
export function FilterBar({
  children,
  extras,
  dirty,
  onClear,
}: {
  children: ReactNode
  extras?: ReactNode
  dirty: boolean
  onClear: () => void
}) {
  return (
    <section className="filter-bar" aria-label="Filtros da análise">
      <span className="filter-bar-title">
        <SlidersHorizontal size={14} />
        Filtros
      </span>
      {children}
      <div className="filter-bar-end">
        {extras}
        {dirty && (
          <button type="button" className="filter-bar-clear" onClick={onClear}>
            Limpar
          </button>
        )}
      </div>
    </section>
  )
}
