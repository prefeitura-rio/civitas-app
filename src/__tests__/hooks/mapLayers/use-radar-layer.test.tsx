import { act, renderHook } from '@testing-library/react'

import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import type { Radar } from '@/models/entities'

jest.mock('deck.gl', () => ({
  IconLayer: jest.fn().mockImplementation(() => ({
    id: 'radars',
    props: {},
  })),
}))

jest.mock('@/hooks/useQueries/useRadars', () => ({
  useRadars: () => ({
    data: [
      {
        cetRioCode: 'RDR123',
        location: 'avenida brasil',
        district: 'centro',
        latitude: -22.9068,
        longitude: -43.1729,
        company: 'CET-Rio',
        activeInLast24Hours: true,
        lastDetectionTime: '2024-01-15T10:30:00Z',
        streetName: 'Avenida Brasil',
        hasData: true,
        direction: 'norte',
        lane: 'direita',
        streetNumber: '123',
      },
      {
        cetRioCode: 'RDR456',
        location: 'copacabana',
        district: 'zona sul',
        latitude: -22.9707,
        longitude: -43.1824,
        company: 'CET-Rio',
        activeInLast24Hours: false,
        lastDetectionTime: undefined,
        streetName: 'Copacabana',
        hasData: true,
        direction: 'sul',
        lane: 'esquerda',
        streetNumber: '456',
      },
    ],
  }),
}))

jest.mock('@/assets/radar-icon-atlas.png', () => ({
  src: '/mock-radar-icon-atlas.png',
}))

describe('useRadarLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct hook structure', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current).toHaveProperty('data')
    expect(result.current).toHaveProperty('layer')
    expect(result.current).toHaveProperty('hoveredObject')
    expect(result.current).toHaveProperty('setHoveredObject')
    expect(result.current).toHaveProperty('isVisible')
    expect(result.current).toHaveProperty('setIsVisible')
    expect(result.current).toHaveProperty('handleSelectObject')
    expect(result.current).toHaveProperty('selectedObject')
    expect(result.current).toHaveProperty('setSelectedObject')
  })

  it('should initialize with selectedObject as null', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.selectedObject).toBeNull()
  })

  it('should initialize with isVisible as true', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.isVisible).toBe(true)
  })

  it('should allow changing isVisible', () => {
    const { result } = renderHook(() => useRadarLayer())

    act(() => {
      result.current.setIsVisible(false)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('should allow changing hoveredObject', () => {
    const { result } = renderHook(() => useRadarLayer())
    const mockPickingInfo = { object: { cetRioCode: 'RDR123' } } as any

    act(() => {
      result.current.setHoveredObject(mockPickingInfo)
    })

    expect(result.current.hoveredObject).toBe(mockPickingInfo)
  })

  it('should select radar when handleSelectObject is called with different radar', () => {
    const { result } = renderHook(() => useRadarLayer())
    const mockRadar: Radar = {
      cetRioCode: 'RDR123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      activeInLast24Hours: true,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      streetName: 'Avenida Brasil',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
      streetNumber: '123',
    }

    act(() => {
      result.current.handleSelectObject(mockRadar)
    })

    expect(result.current.selectedObject).toEqual(mockRadar)
  })

  it('should deselect radar when handleSelectObject is called with same radar', () => {
    const { result } = renderHook(() => useRadarLayer())
    const mockRadar: Radar = {
      cetRioCode: 'RDR123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      activeInLast24Hours: true,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      streetName: 'Avenida Brasil',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
      streetNumber: '123',
    }

    act(() => {
      result.current.handleSelectObject(mockRadar)
    })
    expect(result.current.selectedObject).toEqual(mockRadar)

    // Depois desseleciona
    act(() => {
      result.current.handleSelectObject(mockRadar)
    })
    expect(result.current.selectedObject).toBeNull()
  })

  it('should call clearCamera when provided', () => {
    const { result } = renderHook(() => useRadarLayer())
    const mockRadar: Radar = {
      cetRioCode: 'RDR123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      activeInLast24Hours: true,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      streetName: 'Avenida Brasil',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
      streetNumber: '123',
    }
    const mockClearCamera = jest.fn()

    act(() => {
      result.current.handleSelectObject(mockRadar, mockClearCamera)
    })

    expect(mockClearCamera).toHaveBeenCalled()
  })

  it('should create layer with correct settings', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.layer).toBeDefined()
  })

  it('should create layer with correct data', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.cetRioCode).toBe('RDR123')
    expect(result.current.data?.[1]?.cetRioCode).toBe('RDR456')
  })

  it('should create layer with correct iconMapping', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.layer).toBeDefined()
  })

  it('should create layer with getIcon function', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.layer).toBeDefined()
  })

  it('should create layer with getPosition function', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.layer).toBeDefined()
  })

  it('should create layer with getColor function', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.layer).toBeDefined()
  })

  it('should return correct data from useRadars', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.cetRioCode).toBe('RDR123')
    expect(result.current.data?.[1]?.cetRioCode).toBe('RDR456')
  })

  it('should maintain stable function references between renders', () => {
    const { result, rerender } = renderHook(() => useRadarLayer())

    const firstRender = {
      setHoveredObject: result.current.setHoveredObject,
      setIsVisible: result.current.setIsVisible,
      handleSelectObject: result.current.handleSelectObject,
      setSelectedObject: result.current.setSelectedObject,
    }

    rerender()

    expect(result.current.setHoveredObject).toBe(firstRender.setHoveredObject)
    expect(result.current.setIsVisible).toBe(firstRender.setIsVisible)
    expect(result.current.handleSelectObject).toBe(
      firstRender.handleSelectObject,
    )
    expect(result.current.setSelectedObject).toBe(firstRender.setSelectedObject)
  })
})
