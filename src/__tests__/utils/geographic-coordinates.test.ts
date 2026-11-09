import { isValidAddressCoordinates } from '@/utils/cortex-address'
import { geographicCoordinatesSchema } from '@/utils/geographic-coordinates'

describe('geographicCoordinatesSchema', () => {
  it.each([
    [0, 0],
    [0, 1],
    [1, 0],
    [-180, -90],
    [180, 90],
  ])('accepts valid coordinates %s, %s', (lng, lat) => {
    expect(geographicCoordinatesSchema.safeParse([lng, lat]).success).toBe(true)
  })

  it.each([
    [null, 0],
    [0, undefined],
    [NaN, 1],
    [Infinity, 1],
    [-181, 1],
    [181, 1],
    [1, -91],
    [1, 91],
    ['0', 0],
    [0, 0, 0],
  ])('rejects invalid coordinates %j', (...coordinates) => {
    expect(geographicCoordinatesSchema.safeParse(coordinates).success).toBe(
      false,
    )
  })

  it('keeps the address-specific zero sentinel separate', () => {
    expect(isValidAddressCoordinates([0, 0])).toBe(false)
    expect(isValidAddressCoordinates([0, 1])).toBe(true)
    expect(isValidAddressCoordinates([1, 0])).toBe(true)
  })
})
