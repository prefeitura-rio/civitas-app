import { act, renderHook } from '@testing-library/react'

import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import type { Radar } from '@/models/entities'
import { useMapStore } from '@/stores/use-map-store'

jest.mock('@/stores/use-map-store')

jest.mock('@/hooks/useQueries/useRadars', () => ({
  useRadars: () => ({
    data: [
      {
        cetRioCode: '0540461121',
        location: 'ESTRADA DOS BANDEIRANTES',
        district: 'centro',
        latitude: -22.9068,
        longitude: -43.1729,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461122',
        location: 'AVENIDA BRASIL',
        district: 'zona norte',
        latitude: -22.9069,
        longitude: -43.173,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461123',
        location: 'COPACABANA',
        district: 'zona sul',
        latitude: -22.907,
        longitude: -43.1731,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461124',
        location: 'TIJUCA',
        district: 'zona norte',
        latitude: -22.9071,
        longitude: -43.1732,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
      {
        cetRioCode: '0540461125',
        location: 'BARRA DA TIJUCA',
        district: 'zona oeste',
        latitude: -22.9072,
        longitude: -43.1733,
        company: 'CET-Rio',
        activeInLast24Hours: true,
      },
    ] as Radar[],
  }),
}))

describe('useRadarLayer - Multi-selection bug', () => {
  let mockSetMultipleSelectedRadars: jest.Mock
  let mockMultipleSelectedRadars: string[]

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetMultipleSelectedRadars = jest.fn()
    mockMultipleSelectedRadars = []
    ;(useMapStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (selector.toString().includes('setMultipleSelectedRadars')) {
        return mockSetMultipleSelectedRadars
      }
      return mockMultipleSelectedRadars
    })
  })

  it('should reproduce bug: select 4+ radars, deselect some, reselect', () => {
    const { result, rerender } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    const radars = [
      { cetRioCode: '0540461121' } as Radar,
      { cetRioCode: '0540461122' } as Radar,
      { cetRioCode: '0540461123' } as Radar,
      { cetRioCode: '0540461124' } as Radar,
    ]

    act(() => {
      radars.forEach((radar) => {
        result.current.handleMultiSelectObject(radar)
      })
    })

    expect(mockSetMultipleSelectedRadars).toHaveBeenCalledTimes(4)
    const calls = mockSetMultipleSelectedRadars.mock.calls
    let currentState: string[] = []

    calls.forEach((call) => {
      const [updaterFn] = call
      if (typeof updaterFn === 'function') {
        currentState = updaterFn(currentState)
      }
    })

    expect(currentState).toEqual([
      '0540461124',
      '0540461123',
      '0540461122',
      '0540461121',
    ])

    mockMultipleSelectedRadars = [
      '0540461124',
      '0540461123',
      '0540461122',
      '0540461121',
    ]
    rerender()

    act(() => {
      result.current.handleMultiSelectObject({
        cetRioCode: '0540461122',
      } as Radar)
    })

    mockMultipleSelectedRadars = ['0540461124', '0540461123', '0540461121']
    rerender()

    act(() => {
      result.current.handleMultiSelectObject({
        cetRioCode: '0540461125',
      } as Radar)
    })

    expect(mockSetMultipleSelectedRadars).toHaveBeenCalledTimes(6)
  })

  it('should verify if selectedObjects is calculated correctly', () => {
    mockMultipleSelectedRadars = ['0540461121', '0540461123']

    const { result } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    expect(result.current.selectedObjects).toHaveLength(2)
    expect(result.current.selectedObjects.map((r) => r.cetRioCode)).toEqual([
      '0540461121',
      '0540461123',
    ])
  })

  it('should verify if state does not change when it should not', () => {
    mockMultipleSelectedRadars = ['0540461121', '0540461122']

    const { result, rerender } = renderHook(() =>
      useRadarLayer(mockMultipleSelectedRadars),
    )

    const initialSelectedObjects = result.current.selectedObjects

    rerender()

    expect(result.current.selectedObjects).toStrictEqual(initialSelectedObjects)
  })
})
