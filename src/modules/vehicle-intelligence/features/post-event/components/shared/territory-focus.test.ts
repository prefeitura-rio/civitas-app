import { territoryFocusOf } from '@/modules/vehicle-intelligence/features/post-event/components/shared/territory-focus'

describe('territoryFocusOf', () => {
  const connection = {
    origin_latitude: 1,
    origin_longitude: 2,
    destination_latitude: 3,
    destination_longitude: 4,
  }

  it('sem polo aberto, sem foco', () => {
    expect(territoryFocusOf(null, [connection])).toBeNull()
  })

  it('o polo aberto e as duas pontas de cada conexão', () => {
    expect(
      territoryFocusOf({ latitude: 5, longitude: 6 }, [connection]),
    ).toEqual([
      [5, 6],
      [1, 2],
      [3, 4],
    ])
  })
})
