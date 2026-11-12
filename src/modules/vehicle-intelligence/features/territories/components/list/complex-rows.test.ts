import {
  buildComplexRows,
  percentOf,
  visibleComplexRows,
} from '@/modules/vehicle-intelligence/features/territories/components/list/complex-rows'
import type { TerritoryComplex } from '@/modules/vehicle-intelligence/features/territories/types'

const complex = (overrides: Partial<TerritoryComplex>): TerritoryComplex => ({
  complex: 'Maré',
  faction: null,
  latitude: null,
  longitude: null,
  region: 'Norte',
  in_region: false,
  plates: 10,
  highlighted: [],
  cited: [],
  from_outside: 0,
  with_profile: 0,
  departure_plates: 0,
  disconnection_plates: 0,
  shared_plates: 0,
  ...overrides,
})
const plate = (code: string, cited = false, also: string[] = []) => ({
  plate: code,
  rank: 1,
  cited,
  also,
})

describe('territórios: linhas da tabela', () => {
  it('separa as placas em destaque em sem marca e conhecidas (citadas ou no Cerco)', () => {
    const [row] = buildComplexRows(
      [
        complex({
          plates: 4,
          highlighted: [
            plate('A'),
            plate('B', true),
            plate('C', false, ['Rocinha']),
          ],
        }),
      ],
      (code) => code === 'C',
    )
    expect(row.unmarked).toEqual(['A'])
    expect(row.known).toEqual(['B', 'C'])
    expect(row.concentration).toBe(0.75)
    expect(row.otherBases.get('C')).toEqual(['Rocinha'])
  })

  it('filtra pela região e ordena pela chave, depois pelo destaque e pelo nome', () => {
    const rows = buildComplexRows(
      [
        complex({ complex: 'B', plates: 30, highlighted: [plate('1')] }),
        complex({ complex: 'A', plates: 30, highlighted: [plate('2')] }),
        complex({
          complex: 'C',
          plates: 5,
          in_region: true,
          highlighted: [plate('3', true), plate('4', true)],
        }),
      ],
      () => false,
    )
    expect(
      visibleComplexRows(rows, 'all', 'highlighted', false).map(
        (r) => r.complex,
      ),
    ).toEqual(['C', 'A', 'B'])
    expect(
      visibleComplexRows(rows, 'all', 'plates', false).map((r) => r.complex),
    ).toEqual(['A', 'B', 'C'])
    expect(
      visibleComplexRows(rows, 'outside', 'highlighted', false).map(
        (r) => r.complex,
      ),
    ).toEqual(['A', 'B'])
    expect(visibleComplexRows(rows, 'inside', 'highlighted', true)).toEqual([])
  })

  it('escreve a porcentagem, com traço sem total', () => {
    expect(percentOf(1, 3)).toBe('33%')
    expect(percentOf(1, 0)).toBe('—')
  })
})
