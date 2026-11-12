/**
 * Filtros das telas de análise. Seletores do trilho do grafo (CategoryFilter, CispFilter) e a barra de pills do
 * pós-evento, de grupos e de territórios (handoff de 09/10): uma linha em que cada pill abre um popover com as opções
 * do filtro. Cada peça mora no próprio arquivo; as telas importam daqui.
 */
export { CategoryFilter } from '@/modules/vehicle-intelligence/components/filters/category-filter'
export { ChoicePill } from '@/modules/vehicle-intelligence/components/filters/choice-pill'
export { CispFilter } from '@/modules/vehicle-intelligence/components/filters/cisp-filter'
export { CispPill } from '@/modules/vehicle-intelligence/components/filters/cisp-pill'
export {
  ALL_PERIOD,
  periodDates,
  type FactPeriodFilter,
  type PeriodPreset,
} from '@/modules/vehicle-intelligence/components/filters/fact-period'
export { FilterBar } from '@/modules/vehicle-intelligence/components/filters/filter-bar'
export { MODALITY_SHORT_LABELS } from '@/modules/vehicle-intelligence/components/filters/filter-options'
export { FilterPill } from '@/modules/vehicle-intelligence/components/filters/filter-pill'
export { FilterToggle } from '@/modules/vehicle-intelligence/components/filters/filter-toggle'
export { MultiPill } from '@/modules/vehicle-intelligence/components/filters/multi-pill'
export { PeriodPill } from '@/modules/vehicle-intelligence/components/filters/period-pill'
