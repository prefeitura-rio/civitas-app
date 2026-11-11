import { cispSecondaryLabel } from '@/modules/vehicle-intelligence/components/filters/filter-options'
import { MultiPill } from '@/modules/vehicle-intelligence/components/filters/multi-pill'
import type { CispOption } from '@/modules/vehicle-intelligence/types/domain'

/** CISPs com o nome da delegacia e busca. */
export function CispPill({
  options,
  selected,
  onChange,
}: {
  options: CispOption[]
  selected: string[]
  onChange: (value: string[]) => void
}) {
  return (
    <MultiPill
      label="CISP"
      allLabel="Todas"
      searchable
      selected={selected}
      onChange={onChange}
      options={options.map((item) => ({
        value: item.codigo,
        label: `CISP ${item.codigo}`,
        hint: cispSecondaryLabel(item) || undefined,
      }))}
    />
  )
}
