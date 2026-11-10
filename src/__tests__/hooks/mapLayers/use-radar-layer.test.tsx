import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { PickingInfo } from 'deck.gl'
import type { ReactNode } from 'react'

import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import type { CollectionPoint } from '@/models/entities'

const mockCollectionPoint: CollectionPoint = {
  cetRioCode: 'RDR123',
  location: 'avenida brasil',
  district: 'centro',
  latitude: -22.9068,
  longitude: -43.1729,
  company: 'CET-Rio',
  activeInLast24Hours: true,
  lastDetectionTime: '2024-01-15T10:30:00Z',
  statusAtivo: 'ativo',
  totalDetections: 100,
  direction: 'norte',
  lane: 'direita',
}

const mockAdditionalCollectionPoints: CollectionPoint[] = []
let mockLoadingCollectionPoints = false

jest.mock('deck.gl', () => ({
  IconLayer: jest.fn().mockImplementation((props) => ({
    id: props.id,
    props,
  })),
}))

jest.mock('@/stores/use-map-store', () => ({
  useMapStore: (
    selector: (state: { setMultipleSelectedRadars: jest.Mock }) => unknown,
  ) => selector({ setMultipleSelectedRadars: jest.fn() }),
}))

jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({
    data: mockLoadingCollectionPoints
      ? undefined
      : [
          {
            cetRioCode: 'RDR123',
            location: 'avenida brasil',
            district: 'centro',
            latitude: -22.9068,
            longitude: -43.1729,
            company: 'CET-Rio',
            activeInLast24Hours: true,
            lastDetectionTime: '2024-01-15T10:30:00Z',
            statusAtivo: 'ativo',
            totalDetections: 100,
            direction: 'norte',
            lane: 'direita',
          },
          {
            cetRioCode: 'RDR456',
            location: 'copacabana',
            district: 'zona sul',
            latitude: -22.9707,
            longitude: -43.1824,
            company: 'CET-Rio',
            activeInLast24Hours: false,
            lastDetectionTime: null,
            statusAtivo: 'inativo',
            totalDetections: 0,
            direction: 'sul',
            lane: 'esquerda',
          },
          ...mockAdditionalCollectionPoints,
        ],
  }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const renderUseRadarLayer = () =>
  renderHook(() => useRadarLayer(), { wrapper: createWrapper() })

describe('useRadarLayer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAdditionalCollectionPoints.length = 0
  })

  it('deve retornar estrutura correta do hook', () => {
    const { result } = renderUseRadarLayer()

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

  it('deve inicializar com selectedObject como null', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.selectedObject).toBeNull()
  })

  it('deve inicializar com isVisible como true', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.isVisible).toBe(true)
  })

  it('deve permitir alterar isVisible', () => {
    const { result } = renderUseRadarLayer()

    act(() => {
      result.current.setIsVisible(false)
    })

    expect(result.current.isVisible).toBe(false)
  })

  it('deve permitir alterar hoveredObject', () => {
    const { result } = renderUseRadarLayer()
    const mockPickingInfo = { object: { cetRioCode: 'RDR123' } } as any

    act(() => {
      result.current.setHoveredObject(mockPickingInfo)
    })

    expect(result.current.hoveredObject).toBe(mockPickingInfo)
  })

  it('deve selecionar radar quando handleSelectObject é chamado com radar diferente', () => {
    const { result } = renderHook(() => useRadarLayer())

    act(() => {
      result.current.handleSelectObject(mockCollectionPoint)
    })

    expect(result.current.selectedObject).toEqual(mockCollectionPoint)
  })

  it('deve desselecionar radar quando handleSelectObject é chamado com mesmo radar', () => {
    const { result } = renderHook(() => useRadarLayer())

    act(() => {
      result.current.handleSelectObject(mockCollectionPoint)
    })
    expect(result.current.selectedObject).toEqual(mockCollectionPoint)

    // Depois desseleciona
    act(() => {
      result.current.handleSelectObject(mockCollectionPoint)
    })
    expect(result.current.selectedObject).toBeNull()
  })

  it('deve chamar clearCamera quando fornecido', () => {
    const { result } = renderHook(() => useRadarLayer())
    const mockClearCamera = jest.fn()

    act(() => {
      result.current.handleSelectObject(mockCollectionPoint, mockClearCamera)
    })

    expect(mockClearCamera).toHaveBeenCalled()
  })

  it('deve criar layer com configurações corretas', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve criar layer com dados corretos', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.cetRioCode).toBe('RDR123')
    expect(result.current.data?.[1]?.cetRioCode).toBe('RDR456')
  })

  it('deve criar layer usando o mapeamento do atlas Lucide por origem', () => {
    const { result } = renderUseRadarLayer()
    const getIcon = result.current.layer.props.getIcon as unknown as (
      point: CollectionPoint,
    ) => string

    expect(getIcon(mockCollectionPoint)).toBe('active-normal')
  })

  it('deve criar layer com getPosition function', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve criar layer com getIcon function', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer.props.getIcon).toEqual(expect.any(Function))
  })

  it('deve retornar dados corretos do useCollectionPoints', () => {
    const { result } = renderHook(() => useRadarLayer())

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.cetRioCode).toBe('RDR123')
    expect(result.current.data?.[1]?.cetRioCode).toBe('RDR456')
  })

  it('renders while collection points are still loading', () => {
    mockLoadingCollectionPoints = true
    try {
      const { result } = renderUseRadarLayer()
      expect(result.current.data).toBeUndefined()
      expect(result.current.layer).toBeDefined()
    } finally {
      mockLoadingCollectionPoints = false
    }
  })

  it('deve manter referência estável das funções entre renders', () => {
    const { result, rerender } = renderUseRadarLayer()

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

  it('deve plotar todas as origens numa única camada, com a mesma cor', () => {
    const gabriel = {
      ...mockCollectionPoint,
      cetRioCode: 'GAB123',
      company: 'GABRIEL',
    }
    const civitas = {
      ...mockCollectionPoint,
      cetRioCode: 'CIV123',
      company: 'CIVITAS',
    }
    mockAdditionalCollectionPoints.push(gabriel, civitas)
    const { result } = renderUseRadarLayer()
    const props = result.current.layer.props
    const getIcon = props.getIcon as unknown as (
      point: CollectionPoint,
    ) => string

    expect(props.data).toContainEqual(gabriel)
    expect(props.data).toContainEqual(civitas)
    expect(getIcon(gabriel)).toBe('active-normal')
    expect(getIcon(civitas)).toBe('active-normal')
  })

  it('deve ocultar origens filtradas mantendo a contagem total', () => {
    const civitas = {
      ...mockCollectionPoint,
      cetRioCode: 'CIV123',
      company: 'CIVITAS',
    }
    mockAdditionalCollectionPoints.push(civitas)
    const { result } = renderUseRadarLayer()

    expect(result.current.originCounts).toEqual([
      { origin: 'CETRIO', count: 2 },
      { origin: 'CIVITAS', count: 1 },
    ])

    act(() => result.current.toggleOrigin('CETRIO'))
    expect(result.current.layer.props.data).toEqual([civitas])
    expect(result.current.visibleData).toEqual([civitas])
    expect(result.current.originCounts).toHaveLength(2)

    act(() => result.current.showAllOrigins())
    expect(result.current.layer.props.data).toHaveLength(3)
  })

  it('deve destacar GABRIEL ao selecionar, passar o mouse e multisselecionar', () => {
    const gabriel = {
      ...mockCollectionPoint,
      cetRioCode: 'GAB123',
      company: 'GABRIEL',
    }
    mockAdditionalCollectionPoints.push(gabriel)
    const { result, rerender } = renderHook(
      ({ selected }: { selected: string[] }) => useRadarLayer(selected),
      { initialProps: { selected: [] as string[] } },
    )
    const getIcon = (point: CollectionPoint) =>
      (
        result.current.layer.props.getIcon as unknown as (
          point: CollectionPoint,
        ) => string
      )(point)
    const inactiveGabriel = { ...gabriel, activeInLast24Hours: false }

    expect(getIcon(gabriel)).toBe('active-normal')
    expect(getIcon(inactiveGabriel)).toBe('inactive-normal')

    act(() => result.current.handleSelectObject(gabriel))
    expect(getIcon(gabriel)).toBe('active-highlighted')
    expect(getIcon(inactiveGabriel)).toBe('inactive-highlighted')
    expect(result.current.layer.props.updateTriggers?.getIcon).toContain(
      gabriel.cetRioCode,
    )

    act(() => {
      result.current.setSelectedObject(null)
      result.current.setHoveredObject({
        object: gabriel,
      } as PickingInfo<CollectionPoint>)
    })
    expect(getIcon(gabriel)).toBe('active-highlighted')
    expect(getIcon(inactiveGabriel)).toBe('inactive-highlighted')

    act(() => result.current.setHoveredObject(null))
    expect(getIcon(gabriel)).toBe('active-normal')

    rerender({ selected: [gabriel.cetRioCode] })
    expect(getIcon(gabriel)).toBe('active-highlighted')
    expect(getIcon(inactiveGabriel)).toBe('inactive-highlighted')
  })
})
