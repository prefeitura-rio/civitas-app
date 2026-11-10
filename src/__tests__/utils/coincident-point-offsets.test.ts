import { getCoincidentPointOffsets } from '@/utils/coincident-point-offsets'

describe('getCoincidentPointOffsets', () => {
  it('separates coincident points without changing geographic coordinates', () => {
    const points = [
      { coordinates: [-43.2, -22.9] as const },
      { coordinates: [-43.2, -22.9] as const },
      { coordinates: [-43.20001, -22.9] as const },
    ]
    const offsets = getCoincidentPointOffsets(
      points,
      (point) => point.coordinates,
    )
    expect(offsets.get(points[0])).toEqual([-43.2, -22.9])
    expect(offsets.get(points[1])?.[0]).toBeCloseTo(-43.19999)
    expect(offsets.get(points[1])?.[1]).toBeCloseTo(-22.90001)
    expect(offsets.get(points[2])).toBeDefined()
    expect(points[0].coordinates).toEqual([-43.2, -22.9])
  })
})
