import { X } from 'lucide-react'

import type { SelectMode } from '@/modules/vehicle-intelligence/features/correlations/selection'

/** As placas selecionadas: clique mostra o resumo de uma; o X a tira da seleção. */
export function InspectorSelection({
  selectedPlates,
  selectedId,
  onSelect,
}: {
  selectedPlates: string[]
  selectedId: string
  onSelect: (plate: string | null, mode?: SelectMode) => void
}) {
  return (
    <div className="inspector-selection" aria-label="Seleção">
      <span>
        {selectedPlates.length} selecionadas · clique para ver o resumo
      </span>
      <div>
        {selectedPlates.map((id) => (
          <span key={id} className={id === selectedId ? 'active' : undefined}>
            <button
              type="button"
              aria-pressed={id === selectedId}
              onClick={() => onSelect(id, 'focus')}
            >
              {id}
            </button>
            <button
              type="button"
              aria-label={`Tirar ${id} da seleção`}
              onClick={() => onSelect(id, 'toggle')}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
