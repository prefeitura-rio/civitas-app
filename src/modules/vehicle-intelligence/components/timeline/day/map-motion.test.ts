import {
  easeOut,
  lerp,
  stepMotionMs,
} from '@/modules/vehicle-intelligence/components/timeline/day/map-motion'

// O jsdom não implementa matchMedia: um padrão mínimo, que cada teste espiona.
if (!window.matchMedia) {
  window.matchMedia = (() => ({
    matches: false,
  })) as unknown as typeof window.matchMedia
}

const reducedMotion = (reduce: boolean) =>
  jest
    .spyOn(window, 'matchMedia')
    .mockReturnValue({ matches: reduce } as MediaQueryList)

describe('movimento do mapa do dia', () => {
  afterEach(() => jest.restoreAllMocks())

  it('tocando, 80% do intervalo até 0,7 s; passo a passo, 0,42 s; arrastando, nada', () => {
    reducedMotion(false)
    expect(stepMotionMs({ playing: true, speed: 850, scrubbing: false })).toBe(
      680,
    )
    expect(stepMotionMs({ playing: true, speed: 2000, scrubbing: false })).toBe(
      700,
    )
    expect(stepMotionMs({ playing: false, speed: 850, scrubbing: false })).toBe(
      420,
    )
    expect(stepMotionMs({ playing: true, speed: 850, scrubbing: true })).toBe(0)
  })

  it('com reduzir movimento, nada se mexe', () => {
    reducedMotion(true)
    expect(stepMotionMs({ playing: true, speed: 850, scrubbing: false })).toBe(
      0,
    )
  })

  it('a curva desacelera e o ponto anda em linha reta', () => {
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0.5)
    expect(lerp([0, 0], [10, -4], 0.5)).toEqual([5, -2])
  })
})
