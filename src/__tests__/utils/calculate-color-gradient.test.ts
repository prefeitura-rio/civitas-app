import type { Point } from '@/models/entities'
import { calculateColorInGradient } from '@/utils/calculate-color-gradient'

describe('calculateColorInGradient', () => {
  describe('when calculating color based on time difference', () => {
    it('should return blue color for same start and end time', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      expect(color).toEqual([97, 175, 239])
    })

    it('should return red color for 60 minutes difference', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      expect(color).toEqual([238, 38, 47])
    })

    it('should return intermediate color for 30 minutes difference', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:30:00Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      const expectedRed = 97 + 0.5 * (238 - 97)
      const expectedGreen = 175 + 0.5 * (38 - 175)
      const expectedBlue = 239 + 0.5 * (47 - 239)

      expect(color[0]).toBeCloseTo(expectedRed, 1)
      expect(color[1]).toBeCloseTo(expectedGreen, 1)
      expect(color[2]).toBeCloseTo(expectedBlue, 1)
    })

    it('should handle point without endTime (uses startTime)', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      expect(color).toEqual([97, 175, 239])
    })
  })

  describe('edge cases', () => {
    it('should handle very small time differences', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T10:00:30Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      expect(color[0]).toBeCloseTo(97, -1)
      expect(color[1]).toBeCloseTo(175, -1)
      expect(color[2]).toBeCloseTo(239, -1)
    })

    it('should handle time differences greater than 60 minutes', () => {
      const point: Point = {
        index: 0,
        from: [-43.1729, -22.9068],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T12:00:00Z',
        cetRioCode: 'TEST001',
        district: 'Test District',
        location: 'Test Location',
        direction: 'North',
        lane: 'Lane 1',
        speed: 50,
        secondsToNextPoint: null,
        cloneAlert: false,
      }

      const color = calculateColorInGradient(point)

      const expectedRed = 97 + 2.0 * (238 - 97)
      const expectedGreen = 175 + 2.0 * (38 - 175)
      const expectedBlue = 239 + 2.0 * (47 - 239)

      expect(color[0]).toBeCloseTo(expectedRed, 1)
      expect(color[1]).toBeCloseTo(expectedGreen, 1)
      expect(color[2]).toBeCloseTo(expectedBlue, 1)
    })
  })
})
