import { useState } from 'react'

import { CategoryFilter } from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { SegmentedChoice } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/segmented-choice'
import type { FieldContext } from '@/modules/vehicle-intelligence/features/correlations/filter-fields/field-types'
import { isMotorcycleType } from '@/modules/vehicle-intelligence/lib/vehicles'

/** "Só motos" cobre o tipo PRF e a inferência por leitura; "Escolher…" abre a lista completa. */
export function VehicleChoice({
  id,
  query,
  set,
  options,
  listLabel,
}: FieldContext & { listLabel: string }) {
  const [choosing, setChoosing] = useState(false)
  const vehicles = options?.veiculos ?? []
  const motorcycles = vehicles.filter(isMotorcycleType)
  const selected = query.veiculos
  const sameSet =
    selected.length === motorcycles.length &&
    motorcycles.every((item) => selected.includes(item))
  const mode = !selected.length
    ? 'all'
    : motorcycles.length && sameSet
      ? 'motos'
      : 'choose'
  return (
    <>
      <SegmentedChoice
        id={id}
        value={mode}
        choices={[
          ['all', 'Todos'],
          ['motos', 'Só motos'],
          ['choose', 'Escolher…'],
        ]}
        onChange={(next) => {
          setChoosing(next === 'choose')
          if (next !== 'choose')
            set({ veiculos: next === 'motos' ? motorcycles : [] })
        }}
      />
      {(choosing || mode === 'choose') && (
        <CategoryFilter
          compact
          label={listLabel}
          defaultOpen={choosing}
          options={vehicles}
          selected={selected}
          onChange={(selectedTypes) => set({ veiculos: selectedTypes })}
        />
      )}
    </>
  )
}
