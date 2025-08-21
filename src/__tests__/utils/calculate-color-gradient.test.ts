import type { Point } from '@/models/entities'
import { calculateColorInGradient } from '@/utils/calculate-color-gradient'

describe('calculateColorInGradient', () => {
  // Cores fixas definidas na função original:
  // - Azul claro para tempos menores (0 minutos)
  // - Vermelho para tempos maiores (60+ minutos)
  const BLUE_COLOR = [97, 175, 239] as const // RGB para azul claro
  const RED_COLOR = [238, 38, 47] as const // RGB para vermelho

  const createMockPoint = (startTime: string, endTime?: string): Point => ({
    index: 0,
    from: [-43.1729, -22.9068],
    startTime,
    endTime,
    cetRioCode: 'TEST001',
    district: 'Test District',
    location: 'Test Location',
    direction: 'North',
    lane: 'Lane 1',
    speed: 50,
    secondsToNextPoint: null,
    cloneAlert: false,
  })

  describe('gradient calculation based on time difference', () => {
    it('should return blue when start and end times are the same (0 minutes)', () => {
      const point = createMockPoint(
        '2024-01-01T10:00:00Z',
        '2024-01-01T10:00:00Z',
      )

      const color = calculateColorInGradient(point)

      expect(color).toEqual(BLUE_COLOR)
    })

    it('should return red when time difference is 60 minutes', () => {
      const point = createMockPoint(
        '2024-01-01T10:00:00Z',
        '2024-01-01T11:00:00Z',
      )

      const color = calculateColorInGradient(point)

      expect(color).toEqual(RED_COLOR)
    })

    it('should return color halfway between blue and red for 30 minutes', () => {
      const point = createMockPoint(
        '2024-01-01T10:00:00Z',
        '2024-01-01T10:30:00Z',
      )

      const color = calculateColorInGradient(point)

      // Cálculo da interpolação linear: cor_inicial + 50% * (cor_final - cor_inicial)
      // 30 minutos = 50% do caminho entre 0 e 60 minutos
      const expectedRed = BLUE_COLOR[0] + 0.5 * (RED_COLOR[0] - BLUE_COLOR[0]) // 97 + 0.5 * (238 - 97) = 167.5
      const expectedGreen = BLUE_COLOR[1] + 0.5 * (RED_COLOR[1] - BLUE_COLOR[1]) // 175 + 0.5 * (38 - 175) = 106.5
      const expectedBlue = BLUE_COLOR[2] + 0.5 * (RED_COLOR[2] - BLUE_COLOR[2]) // 239 + 0.5 * (47 - 239) = 143

      expect(color[0]).toBeCloseTo(expectedRed, 1)
      expect(color[1]).toBeCloseTo(expectedGreen, 1)
      expect(color[2]).toBeCloseTo(expectedBlue, 1)
    })

    it('should handle missing endTime by using startTime (0 minutes difference)', () => {
      const point = createMockPoint('2024-01-01T10:00:00Z')

      const color = calculateColorInGradient(point)

      expect(color).toEqual(BLUE_COLOR)
    })
  })

  describe('edge cases', () => {
    it('should handle very small time differences (30 seconds)', () => {
      const point = createMockPoint(
        '2024-01-01T10:00:00Z',
        '2024-01-01T10:00:30Z',
      )

      const color = calculateColorInGradient(point)

      // 30 segundos = 0.5 minutos = muito próximo de 0%
      // Resultado deve estar muito próximo da cor azul inicial
      expect(color[0]).toBeCloseTo(BLUE_COLOR[0], -1)
      expect(color[1]).toBeCloseTo(BLUE_COLOR[1], -1)
      expect(color[2]).toBeCloseTo(BLUE_COLOR[2], -1)
    })

    it('should handle time differences greater than 60 minutes (120 minutes)', () => {
      const point = createMockPoint(
        '2024-01-01T10:00:00Z',
        '2024-01-01T12:00:00Z',
      )

      const color = calculateColorInGradient(point)

      // Para 120 minutos, o percentual é 2.0 (200% do range de 60 minutos)
      // A função extrapola além do vermelho quando > 60 minutos
      const percentMultiplier = 2.0
      const expectedRed =
        BLUE_COLOR[0] + percentMultiplier * (RED_COLOR[0] - BLUE_COLOR[0]) // 97 + 2.0 * (238 - 97) = 379
      const expectedGreen =
        BLUE_COLOR[1] + percentMultiplier * (RED_COLOR[1] - BLUE_COLOR[1]) // 175 + 2.0 * (38 - 175) = 1
      const expectedBlue =
        BLUE_COLOR[2] + percentMultiplier * (RED_COLOR[2] - BLUE_COLOR[2]) // 239 + 2.0 * (47 - 239) = -145

      expect(color[0]).toBeCloseTo(expectedRed, 1)
      expect(color[1]).toBeCloseTo(expectedGreen, 1)
      expect(color[2]).toBeCloseTo(expectedBlue, 1)
    })
  })
})
