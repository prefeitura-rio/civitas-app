import {
  baseStrength,
  rankingNote,
} from '@/modules/vehicle-intelligence/features/territories/components/profile/base-plates'
import type { TerritoryMember } from '@/modules/vehicle-intelligence/features/territories/types'

const member = (overrides: Partial<TerritoryMember>): TerritoryMember =>
  ({
    plate: 'AAA1A11',
    rank: null,
    group: null,
    departure: null,
    disconnection: null,
    ...overrides,
  }) as TerritoryMember

describe('território: placas de base', () => {
  it('mede a base pela maior evidência entre partida e desconexão', () => {
    expect(
      baseStrength(
        member({
          departure: { count: 2, total: 4, lift: 10 },
          disconnection: { count: 3, total: 3, lift: 2 },
        }),
      ),
    ).toBe(5)
    expect(baseStrength(member({}))).toBe(-1)
  })

  it('escreve a posição no ranking e o grupo', () => {
    expect(rankingNote(member({ rank: 4, group: 'G1' }))).toBe(
      '4ª no ranking · G1',
    )
    expect(rankingNote(member({}), 'fora do ranking')).toBe('fora do ranking')
    expect(rankingNote(undefined)).toBe('')
  })
})
