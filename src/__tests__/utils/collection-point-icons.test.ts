import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  COLLECTION_POINT_ICON_MAPPING,
  getCollectionPointIcon,
} from '@/utils/collection-point-icons'

describe('collection point icons', () => {
  const atlasSvg = readFileSync(
    join(process.cwd(), 'src/assets/collection-point-icon-atlas.svg'),
    'utf8',
  )

  it.each([
    ['CETRIO', 'cetrio'],
    ['CET-Rio', 'cetrio'],
    ['CIVITAS', 'civitas'],
    ['civitas', 'civitas'],
    [' CiViTaS ', 'civitas'],
    ['GABRIEL', 'gabriel'],
    ['gabriel', 'gabriel'],
    [' gabriel ', 'gabriel'],
    [null, 'cetrio'],
    ['OTHER', 'cetrio'],
  ])('uses the atlas row for source %s', (company, source) => {
    expect(getCollectionPointIcon({ company, activeInLast24Hours: true })).toBe(
      `${source}-active-normal`,
    )
  })

  it('selects atlas entries for normal and highlighted states', () => {
    const normal = getCollectionPointIcon({
      company: 'GABRIEL',
      activeInLast24Hours: true,
    })
    const highlighted = getCollectionPointIcon(
      { company: 'GABRIEL', activeInLast24Hours: true },
      true,
    )

    expect(normal).toBe('gabriel-active-normal')
    expect(highlighted).toBe('gabriel-active-highlighted')
    expect(COLLECTION_POINT_ICON_MAPPING[normal]).toEqual(
      expect.objectContaining({ x: 0, y: 96 }),
    )
    expect(COLLECTION_POINT_ICON_MAPPING[highlighted]).toEqual(
      expect.objectContaining({ x: 48, y: 96 }),
    )
  })

  it('selects slash variants for inactive collection points', () => {
    const normal = getCollectionPointIcon({
      company: 'GABRIEL',
      activeInLast24Hours: false,
    })
    const highlighted = getCollectionPointIcon(
      { company: 'GABRIEL', activeInLast24Hours: false },
      true,
    )

    expect(normal).toBe('gabriel-inactive-normal')
    expect(highlighted).toBe('gabriel-inactive-highlighted')
    expect(COLLECTION_POINT_ICON_MAPPING[normal]).toEqual(
      expect.objectContaining({ x: 96, y: 96 }),
    )
    expect(COLLECTION_POINT_ICON_MAPPING[highlighted]).toEqual(
      expect.objectContaining({ x: 144, y: 96 }),
    )
  })

  it('keeps the Lucide atlas colors, fills, and slash direction', () => {
    expect(atlasSvg).toContain('color="#f97316" fill="#ffffff"')
    expect(atlasSvg).toContain('color="#000000" fill="#f97316"')
    expect(atlasSvg).toContain('color="#6115f9" fill="#ffffff"')
    expect(atlasSvg).toContain('color="#000000" fill="#6115f9"')
    expect(atlasSvg).toContain('color="#027516" fill="#ffffff"')
    expect(atlasSvg).toContain('color="#000000" fill="#027516"')
    expect(atlasSvg).toContain('d="M4 44 44 4"')
  })
})
