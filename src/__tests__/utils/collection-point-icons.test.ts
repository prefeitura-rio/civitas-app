import {
  COLLECTION_POINT_ICON_MAPPING,
  getCollectionPointIcon,
} from '@/utils/collection-point-icons'

describe('collection point icons', () => {
  it('selects an existing atlas entry for every activity and highlight state', () => {
    for (const activeInLast24Hours of [true, false]) {
      for (const highlighted of [true, false]) {
        const key = getCollectionPointIcon({ activeInLast24Hours }, highlighted)
        expect(key).toBe(
          `${activeInLast24Hours ? 'active' : 'inactive'}-${highlighted ? 'highlighted' : 'normal'}`,
        )
        expect(COLLECTION_POINT_ICON_MAPPING[key]).toBeDefined()
      }
    }
  })

  it('uses the same color row for every company', () => {
    for (const company of ['CETRIO', 'CIVITAS', 'GABRIEL', 'OTHER', null]) {
      const point = { company, activeInLast24Hours: true }
      expect(getCollectionPointIcon(point)).toBe('active-normal')
    }
    Object.values(COLLECTION_POINT_ICON_MAPPING).forEach((entry) =>
      expect(entry.y).toBe(0),
    )
  })

  it('selects slash variants for inactive collection points', () => {
    expect(
      COLLECTION_POINT_ICON_MAPPING[
        getCollectionPointIcon({ activeInLast24Hours: false })
      ],
    ).toEqual(expect.objectContaining({ x: 96, y: 0 }))
    expect(
      COLLECTION_POINT_ICON_MAPPING[
        getCollectionPointIcon({ activeInLast24Hours: false }, true)
      ],
    ).toEqual(expect.objectContaining({ x: 144, y: 0 }))
  })
})
