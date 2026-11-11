import { ChoicePill } from '@/modules/vehicle-intelligence/components/filters/analysis-filters'

export type TaxiMode = 'excluir_taxis' | 'todos'

const TAXI_OPTIONS = [
  { value: 'excluir_taxis', label: 'Excluídos' },
  { value: 'todos', label: 'Incluídos' },
]

/** Táxis excluídos (o padrão) ou incluídos, nas páginas de grupos e de territórios. */
export function TaxiFilter({
  value,
  onChange,
}: {
  value: TaxiMode
  onChange: (value: TaxiMode) => void
}) {
  return (
    <ChoicePill
      label="Táxis"
      value={value}
      items={TAXI_OPTIONS}
      onChange={(item) => onChange(item as TaxiMode)}
    />
  )
}
