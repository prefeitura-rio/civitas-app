import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'

import {
  copassagem,
  recorteStorageKey,
} from '@/modules/vehicle-intelligence/config/recortes'
import { FilterField } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/filter-field'
import { FilterFooter } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/filter-footer'
import {
  FilterTabs,
  type GraphFilterTab,
} from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/filter-tabs'
import { useFilterDraft } from '@/modules/vehicle-intelligence/features/correlations/components/filter-rail/use-filter-draft'
import {
  type FieldContext,
  FILTER_FIELDS,
  type FilterFieldDef,
  graphLimitField,
} from '@/modules/vehicle-intelligence/features/correlations/filter-fields'
import {
  changedKeys,
  DEFAULT_QUERY,
  type GraphQuery,
} from '@/modules/vehicle-intelligence/features/correlations/query'
import { sanitizePlates } from '@/modules/vehicle-intelligence/features/correlations/selection'
import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

export function useGraphFilterDraft(applied: GraphQuery) {
  return useFilterDraft(
    applied,
    recorteStorageKey('graph-filter-draft:v2'),
    changedKeys,
  )
}

export function FilterRail({
  applied,
  pending,
  setPending,
  options,
  loading,
  error,
  activityHelp,
  onApply,
}: {
  applied: GraphQuery
  pending: GraphQuery
  setPending: Dispatch<SetStateAction<GraphQuery>>
  options: MasterGraphOptions | null
  loading: boolean
  error: string | null
  activityHelp: string
  onApply: (query: GraphQuery) => void
}) {
  const [tab, setTab] = useState<GraphFilterTab>('fatos')
  const set = (patch: Partial<GraphQuery>) =>
    setPending((current) => ({ ...current, ...patch }))
  const changed = changedKeys(pending, applied)
  const nondefault = changedKeys(pending, DEFAULT_QUERY)
  const context = (field: FilterFieldDef): FieldContext => ({
    id: field.id,
    query: pending,
    set,
    options,
    activityHelp,
  })
  const field = (def: FilterFieldDef) => {
    const ctx = context(def)
    if (def.hidden?.(ctx)) return null
    return (
      <FilterField
        key={def.id}
        id={def.id}
        label={def.label}
        pending={changed.includes(def.key)}
        help={typeof def.help === 'function' ? def.help(ctx) : def.help}
      >
        {def.render(ctx)}
      </FilterField>
    )
  }
  const altered = (fields: FilterFieldDef[]) =>
    nondefault.filter((key) => fields.some((def) => def.key === key)).length
  return (
    <aside
      className="correlation-control-rail graph-filter-rail"
      aria-label="Filtros do grafo e ranking"
    >
      <div className="control-rail-heading">
        <SlidersHorizontal size={18} />
        <div>
          <span>GRAFO E RANKING</span>
          <strong>Filtros</strong>
        </div>
        {(nondefault.length > 0 ||
          changedKeys(applied, DEFAULT_QUERY).length > 0) && (
          <button
            type="button"
            className="graph-filter-reset"
            onClick={() => setPending(DEFAULT_QUERY)}
          >
            <RotateCcw size={13} />
            Padrão
          </button>
        )}
      </div>
      <div className="graph-filter-search">
        <FilterField
          id="graph-plate-search"
          label="Placa"
          pending={changed.includes('plateFilter')}
          help={`Uma ou mais placas ${copassagem ? 'vítimas ou correlatas' : 'correlatas'}, separadas por vírgula ou espaço: o grafo e o ranking mostram a rede de todas juntas.`}
        >
          <div className="graph-filter-search-input">
            <Search size={15} />
            <input
              id="graph-plate-search"
              value={pending.plateFilter}
              placeholder="Ex.: ABC1D23, XYZ9K87"
              onChange={(event) =>
                set({ plateFilter: sanitizePlates(event.target.value) })
              }
            />
          </div>
        </FilterField>
      </div>
      <FilterTabs
        tab={tab}
        onChange={setTab}
        factCount={altered(FILTER_FIELDS.facts)}
        plateCount={altered(FILTER_FIELDS.plates)}
      />
      <div
        className="graph-filter-tab-content"
        role="tabpanel"
        id={`graph-tabpanel-${tab}`}
        aria-labelledby={`graph-tab-${tab}`}
      >
        {(tab === 'fatos' ? FILTER_FIELDS.facts : FILTER_FIELDS.plates).map(
          field,
        )}
      </div>
      <div className="graph-filter-display">
        <strong>EXIBIÇÃO</strong>
        {field(graphLimitField)}
      </div>
      <FilterFooter
        count={changed.length}
        loading={loading}
        error={error}
        canApply={Boolean(options)}
        onDiscard={() => setPending(applied)}
        onApply={() => onApply(pending)}
      />
    </aside>
  )
}
