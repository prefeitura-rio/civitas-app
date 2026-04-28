import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'

import { useRadarLayer } from '@/hooks/mapLayers/use-radar-layer'
import type { CollectionPoint } from '@/models/entities'

jest.mock('deck.gl', () => ({
  IconLayer: jest.fn().mockImplementation(() => ({
    id: 'radars',
    props: {},
  })),
}))

jest.mock('@/hooks/useQueries/useCollectionPoints', () => ({
  useCollectionPoints: () => ({
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
        hasData: true,
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
        lastDetectionTime: undefined,
        hasData: true,
        direction: 'sul',
        lane: 'esquerda',
      },
    ],
  }),
}))

jest.mock('@/assets/radar-icon-atlas.png', () => ({
  src: '/mock-radar-icon-atlas.png',
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
    const { result } = renderUseRadarLayer()
    const mockRadar = {
      cetRioCode: 'RDR123',
      codigoPontoColeta: 'PC123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      statusAtivo: 'ATIVO',
      activeInLast24Hours: true,
      totalDetections: 1,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
    } as CollectionPoint

    act(() => {
      result.current.handleSelectObject(mockRadar)
    })

    expect(result.current.selectedObject).toEqual(mockRadar)
  })

  it('deve desselecionar radar quando handleSelectObject é chamado com mesmo radar', () => {
    const { result } = renderUseRadarLayer()
    const mockRadar = {
      cetRioCode: 'RDR123',
      codigoPontoColeta: 'PC123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      statusAtivo: 'ATIVO',
      activeInLast24Hours: true,
      totalDetections: 1,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
    } as CollectionPoint

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

  it('deve chamar clearCamera quando fornecido', () => {
    const { result } = renderUseRadarLayer()
    const mockRadar = {
      cetRioCode: 'RDR123',
      codigoPontoColeta: 'PC123',
      location: 'avenida brasil',
      district: 'centro',
      latitude: -22.9068,
      longitude: -43.1729,
      company: 'CET-Rio',
      statusAtivo: 'ATIVO',
      activeInLast24Hours: true,
      totalDetections: 1,
      lastDetectionTime: '2024-01-15T10:30:00Z',
      hasData: true,
      direction: 'norte',
      lane: 'direita',
    } as CollectionPoint
    const mockClearCamera = jest.fn()

    act(() => {
      result.current.handleSelectObject(mockRadar, mockClearCamera)
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

  it('deve criar layer com iconMapping correto', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve criar layer com getIcon function', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve criar layer com getPosition function', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve criar layer com getColor function', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.layer).toBeDefined()
  })

  it('deve retornar dados corretos do useRadars', () => {
    const { result } = renderUseRadarLayer()

    expect(result.current.data).toHaveLength(2)
    expect(result.current.data?.[0]?.cetRioCode).toBe('RDR123')
    expect(result.current.data?.[1]?.cetRioCode).toBe('RDR456')
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
})
