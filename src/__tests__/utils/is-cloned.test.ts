import type { Coordinates } from '@/models/utils'
import { isCloned } from '@/utils/is-cloned'

describe('isCloned', () => {
  it('should ignore clone alerts when distance is less than 1 kilometer', () => {
    const pointA: Coordinates = [-43.1729, -22.9068]
    const pointB: Coordinates = [-43.173, -22.9069]

    const result = isCloned({
      pointA: {
        coordinates: pointA,
        dateTime: new Date('2026-01-01T10:00:00.000Z'),
      },
      pointB: {
        coordinates: pointB,
        dateTime: new Date('2026-01-01T10:00:01.000Z'),
      },
    })

    expect(result).toBe(false)
  })

  it('should flag clone alerts when distance is at least 1 kilometer and average speed is at least 110 km/h', () => {
    const pointA: Coordinates = [-43.1729, -22.9068]
    const pointB: Coordinates = [-43.1729, -22.896]

    const result = isCloned({
      pointA: {
        coordinates: pointA,
        dateTime: new Date('2026-01-01T10:00:00.000Z'),
      },
      pointB: {
        coordinates: pointB,
        dateTime: new Date('2026-01-01T10:00:36.000Z'),
      },
    })

    expect(result).toBe(true)
  })
})
