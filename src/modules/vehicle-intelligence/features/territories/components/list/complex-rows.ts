/** As linhas da tabela de complexos: as contas que dependem do Cerco de hoje, o filtro de região e a ordem. */
import type { TerritoryComplex } from '@/modules/vehicle-intelligence/features/territories/types'

/** Complexo com as contas que dependem do Cerco de hoje (feitas aqui, com a mesma lista da etiqueta). */
export interface ComplexRow extends TerritoryComplex {
  unmarked: string[]
  known: string[]
  concentration: number
  otherBases: Map<string, string[]>
}

export type RegionFilter = 'all' | 'outside' | 'inside'
export type SortKey = 'highlighted' | 'unmarked' | 'concentration' | 'plates'

export const percentOf = (part: number, whole: number) =>
  whole ? `${Math.round((100 * part) / whole)}%` : '—'

/** As placas em destaque de cada complexo separadas em sem citação nem Cerco (`unmarked`) e conhecidas (`known`). */
export function buildComplexRows(
  complexes: TerritoryComplex[],
  isInCerco: (plate: string) => boolean,
): ComplexRow[] {
  return complexes.map((c) => {
    const unmarked = c.highlighted
      .filter((h) => !h.cited && !isInCerco(h.plate))
      .map((h) => h.plate)
    const known = c.highlighted
      .filter((h) => h.cited || isInCerco(h.plate))
      .map((h) => h.plate)
    return {
      ...c,
      unmarked,
      known,
      concentration: c.highlighted.length / Math.max(1, c.plates),
      otherBases: new Map(c.highlighted.map((h) => [h.plate, h.also])),
    }
  })
}

/** As linhas da região escolhida (e só as com placa sem citação nem Cerco, se pedido), na ordem escolhida. */
export function visibleComplexRows(
  rows: ComplexRow[],
  region: RegionFilter,
  sortKey: SortKey,
  onlyUnmarked: boolean,
): ComplexRow[] {
  const sortValue: Record<SortKey, (l: ComplexRow) => number> = {
    highlighted: (l) => l.highlighted.length,
    unmarked: (l) => l.unmarked.length,
    concentration: (l) => l.concentration,
    plates: (l) => l.plates,
  }
  return rows
    .filter(
      (l) =>
        (region === 'all' ||
          (region === 'outside' ? !l.in_region : l.in_region)) &&
        (!onlyUnmarked || l.unmarked.length > 0),
    )
    .sort(
      (a, b) =>
        sortValue[sortKey](b) - sortValue[sortKey](a) ||
        b.highlighted.length - a.highlighted.length ||
        a.complex.localeCompare(b.complex),
    )
}
