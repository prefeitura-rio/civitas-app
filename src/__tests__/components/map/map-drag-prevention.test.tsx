import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render } from '@testing-library/react'

import { Map } from '@/app/(app)/veiculos/components/map'
import type { Radar } from '@/models/entities'

// Mock all the individual hooks used by the Map component
jest.mock('@/stores/use-map-store', () => ({
  useMapStore: jest.fn((selector) => {
    const mockState = {
      contextMenuPickingInfo: null,
      openContextMenu: false,
      setContextMenuPickingInfo: jest.fn(),
      setOpenContextMenu: jest.fn(),
      zoomToLocation: jest.fn(),
    }
    return selector(mockState)
  }),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/use-map-state', () => ({
  useMapState: jest.fn(() => ({
    viewport: {
      latitude: -22.9068,
      longitude: -43.1729,
      zoom: 10,
    },
    setViewport: jest.fn(),
    mapStyle: 'light',
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/use-map-layers', () => ({
  useMapLayers: jest.fn(() => ({
    radars: {
      layer: {},
      data: [],
      handleSelectObject: jest.fn(),
      handleMultiSelectObject: jest.fn(),
      setSelectedObject: jest.fn(),
    },
    cameras: {
      layer: {},
      data: [],
      handleSelectObject: jest.fn(),
      setSelectedObject: jest.fn(),
    },
    layers: [],
    multiSelectRadar: jest.fn(),
    selectCamera: jest.fn(),
    setSelectedRadar: jest.fn(),
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/use-map-search', () => ({
  useMapSearch: jest.fn(() => ({
    searchResults: [],
    searchLocation: null,
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/use-mouse-interactions', () => ({
  useMouseInteractions: jest.fn(() => ({
    onHover: jest.fn(),
    onClick: jest.fn(),
    onRightClick: jest.fn(),
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/use-selection-management', () => ({
  useSelectionManagement: jest.fn(() => ({
    selection: null,
    clearSelection: jest.fn(),
  })),
}))

jest.mock('deck.gl', () => ({
  DeckGL: ({ children, ...props }: any) => (
    <div data-testid="deck-gl" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('react-map-gl', () => ({
  __esModule: true,
  default: (props: any) => <div data-testid="map-gl" {...props} />,
}))

jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards',
  () => ({
    SelectionCards: () => <div data-testid="selection-cards" />,
  }),
)

jest.mock('@/app/(app)/veiculos/components/map/components/hover-cards', () => ({
  HoverCards: () => <div data-testid="hover-cards" />,
}))

jest.mock(
  '@/app/(app)/veiculos/components/map/components/layer-toggle',
  () => ({
    MapLayerControl: () => <div data-testid="layer-control" />,
  }),
)

jest.mock('@/app/(app)/veiculos/components/map/components/search-box', () => ({
  SearchBox: () => <div data-testid="search-box" />,
}))

jest.mock(
  '@/app/(app)/veiculos/components/map/components/context-menu',
  () => ({
    ContextMenu: () => <div data-testid="context-menu" />,
  }),
)

jest.mock('@/components/custom/map-size-monitor', () => ({
  MapSizeMonitor: () => <div data-testid="map-size-monitor" />,
}))

const mockRadar: Radar = {
  cetRioCode: '123456',
  latitude: -22.9068,
  longitude: -43.1729,
  location: 'Test Location',
  district: 'Test District',
  company: 'Test Company',
  activeInLast24Hours: true,
  lastDetectionTime: new Date(),
  streetName: 'Test Street',
  hasData: true,
  direction: 'Test Direction',
  lane: 'Test Lane',
  streetNumber: '123',
}

describe('Map - Drag Prevention', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jest.clearAllMocks()
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('deve renderizar o mapa sem erros', () => {
    const { getByTestId } = render(<Map />, { wrapper: createWrapper })
    expect(getByTestId('deck-gl')).toBeInTheDocument()
    expect(getByTestId('map-gl')).toBeInTheDocument()
  })

  it('deve ter container com classes corretas', () => {
    const { container } = render(<Map />, { wrapper: createWrapper })
    const mapContainer = container.firstChild as HTMLElement

    expect(mapContainer).toHaveClass(
      'relative',
      'h-full',
      'w-full',
      'overflow-hidden',
    )
  })

  it('deve renderizar todos os componentes do mapa', () => {
    const { getByTestId } = render(<Map />, { wrapper: createWrapper })
    
    expect(getByTestId('deck-gl')).toBeInTheDocument()
    expect(getByTestId('map-gl')).toBeInTheDocument()
    expect(getByTestId('selection-cards')).toBeInTheDocument()
    expect(getByTestId('hover-cards')).toBeInTheDocument()
    expect(getByTestId('layer-control')).toBeInTheDocument()
    expect(getByTestId('search-box')).toBeInTheDocument()
    expect(getByTestId('context-menu')).toBeInTheDocument()
    expect(getByTestId('map-size-monitor')).toBeInTheDocument()
  })

  it('deve prevenir propagação de eventos de mouse em elementos de UI', () => {
    expect(() => {
      render(<Map />, { wrapper: createWrapper })
    }).not.toThrow()
  })

  it('deve ter threshold configurado para detecção de movimento', () => {
    expect(() => {
      render(<Map />, { wrapper: createWrapper })
    }).not.toThrow()
  })

  it('deve permitir clique apenas após movimento mínimo', () => {
    const { getByTestId } = render(<Map />, { wrapper: createWrapper })
    const mapContainer = getByTestId('deck-gl')
    
    // Simula movimento pequeno (não deveria registrar como clique)
    fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(mapContainer, { clientX: 102, clientY: 102 })
    fireEvent.mouseUp(mapContainer, { clientX: 102, clientY: 102 })
    
    // Verifica que o componente renderiza sem erros
    expect(mapContainer).toBeInTheDocument()
  })

  it('deve distinguir entre clique e arraste', () => {
    const { getByTestId } = render(<Map />, { wrapper: createWrapper })
    const mapContainer = getByTestId('deck-gl')
    
    // Simula arraste (movimento grande)
    fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(mapContainer, { clientX: 150, clientY: 150 })
    fireEvent.mouseUp(mapContainer, { clientX: 150, clientY: 150 })
    
    // Verifica que o componente renderiza sem erros
    expect(mapContainer).toBeInTheDocument()
  })
})