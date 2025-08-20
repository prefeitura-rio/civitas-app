import type { Coordinates } from '@/models/utils'
import { haversineDistance } from '@/utils/haversine-distance'

describe('haversineDistance', () => {
  describe('when calculating distance between coordinates', () => {
    it('should return 0 for the same point', () => {
      const pointA: Coordinates = [-43.1729, -22.9068]
      const pointB: Coordinates = [-43.1729, -22.9068]

      const distance = haversineDistance({ pointA, pointB })

      expect(distance).toBe(0)
    })

    it('should calculate correct distance between Rio de Janeiro and São Paulo', () => {
      const rio: Coordinates = [-43.1729, -22.9068]
      const saoPaulo: Coordinates = [-46.6333, -23.5505]

      const distance = haversineDistance({
        pointA: rio,
        pointB: saoPaulo,
      })

      expect(distance).toBeCloseTo(360749, -3)
    })

    it('should calculate distance between two points in Rio', () => {
      const copacabana: Coordinates = [-43.1882, -22.9711]
      const ipanema: Coordinates = [-43.2096, -22.9838]

      const distance = haversineDistance({
        pointA: copacabana,
        pointB: ipanema,
      })

      expect(distance).toBeCloseTo(2606, -1)
    })

    it('should handle negative coordinates correctly', () => {
      const pointA: Coordinates = [-10.5, -20.3]
      const pointB: Coordinates = [-11.2, -21.1]

      const distance = haversineDistance({ pointA, pointB })

      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })

    it('should handle positive coordinates correctly', () => {
      const pointA: Coordinates = [10.5, 20.3]
      const pointB: Coordinates = [11.2, 21.1]

      const distance = haversineDistance({ pointA, pointB })

      expect(distance).toBeGreaterThan(0)
      expect(typeof distance).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should handle coordinates at equator', () => {
      const pointA: Coordinates = [0, 0]
      const pointB: Coordinates = [1, 0]

      const distance = haversineDistance({ pointA, pointB })

      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeCloseTo(111195, -2)
    })

    it('should handle very small distances', () => {
      const pointA: Coordinates = [-43.1729, -22.9068]
      const pointB: Coordinates = [-43.173, -22.9069]

      const distance = haversineDistance({ pointA, pointB })

      expect(distance).toBeGreaterThan(0)
      expect(distance).toBeLessThan(200)
    })
  })
})
