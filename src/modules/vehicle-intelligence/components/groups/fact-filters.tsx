import {
  ChoicePill,
  CispPill,
  MultiPill,
} from '@/modules/vehicle-intelligence/components/filters/analysis-filters'
import { categoryLabel } from '@/modules/vehicle-intelligence/lib/labels'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

/** Os campos de fato dos filtros (os nomes são as chaves guardadas na sessão do navegador). */
export interface FactFilterValues {
  meses: number | null
  modalidades: string[]
  alvos: string[]
  deslocamentos: string[]
  cisps: string[]
}

const PERIODS = [
  { value: '0', label: 'Todo o período' },
  { value: '6', label: 'Últimos 6 meses' },
  { value: '3', label: 'Últimos 3 meses' },
  { value: '1', label: 'Último mês' },
]

/**
 * O bloco "Fatos" das páginas de grupos e de territórios: período, tipo do fato, alvo, autor (quando a base informa) e
 * delegacia.
 */
export function FactFilters({
  filters,
  options,
  onChange,
}: {
  filters: FactFilterValues
  options: MasterGraphOptions
  onChange: (patch: Partial<FactFilterValues>) => void
}) {
  const modalities = options.modalidades ?? []
  return (
    <div className="groups-filters-block facts">
      <span className="groups-filters-title">Fatos</span>
      <div className="groups-filters-fields">
        <ChoicePill
          label="Período"
          value={String(filters.meses ?? 0)}
          items={PERIODS}
          onChange={(value) => onChange({ meses: Number(value) || null })}
        />
        <ChoicePill
          label="Tipo do fato"
          value={
            filters.modalidades.length === 1 ? filters.modalidades[0] : 'TODOS'
          }
          items={[
            { value: 'TODOS', label: 'Todos' },
            ...modalities.map((value) => ({
              value,
              label: categoryLabel(value),
            })),
          ]}
          onChange={(value) =>
            onChange({ modalidades: value === 'TODOS' ? [] : [value] })
          }
        />
        <MultiPill
          label="Alvo"
          options={(options.alvos ?? []).map((value) => ({ value }))}
          selected={filters.alvos}
          onChange={(alvos) => onChange({ alvos })}
        />
        {(options.deslocamentos ?? []).some(Boolean) && (
          <MultiPill
            label="Autor"
            allLabel="Qualquer"
            options={(options.deslocamentos ?? [])
              .filter(Boolean)
              .map((value) => ({ value }))}
            selected={filters.deslocamentos}
            onChange={(deslocamentos) => onChange({ deslocamentos })}
          />
        )}
        <CispPill
          options={(options.cisps ?? []).map((code) => ({
            codigo: code,
            nome: options.cisp_names?.[code] || `CISP ${code}`,
            total: 0,
          }))}
          selected={filters.cisps}
          onChange={(cisps) => onChange({ cisps })}
        />
      </div>
    </div>
  )
}
