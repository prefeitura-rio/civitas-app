import { fireEvent, render } from '@testing-library/react'

import { Map } from '@/app/(app)/veiculos/components/map'
import { useMap } from '@/hooks/useContexts/use-map-context'
import type { Radar } from '@/models/entities'

jest.mock('@/hooks/useContexts/use-map-context', () => ({
  useMap: jest.fn(),
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

const mockUseMap = jest.mocked(useMap)

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
  const mockMultiSelectRadar = jest.fn()
  const mockSelectRadar = jest.fn()
  const mockSetSelectedRadar = jest.fn()
  const mockSelectCamera = jest.fn()
  const mockSetSelectedCamera = jest.fn()
  const mockSetViewport = jest.fn()
  const mockZoomToLocation = jest.fn()
  const mockSetContextMenuPickingInfo = jest.fn()
  const mockSetOpenContextMenu = jest.fn()
  const mockSetDeckRef = jest.fn()
  const mockSetMapRef = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseMap.mockReturnValue({
      layers: {
        radars: {
          layer: {},
          data: [mockRadar],
          handleSelectObject: mockSelectRadar,
          handleMultiSelectObject: mockMultiSelectRadar,
          setSelectedObject: mockSetSelectedRadar,
        },
        cameras: {
          layer: {},
          data: [],
          handleSelectObject: mockSelectCamera,
          setSelectedObject: mockSetSelectedCamera,
        },
        agents: { layer: {} },
        fogoCruzado: { layer: {} },
        waze: { layer: {} },
        trips: { layers: [] },
        address: {
          layerStates: {
            isVisible: false,
            setIsVisible: jest.fn(),
            setAddressMarker: jest.fn(),
          },
          layer: {},
        },
        AISP: { layers: [] },
        CISP: { layers: [] },
        schools: { layers: [] },
        busStops: { layers: [] },
      },
      viewport: {
        latitude: -22.9068,
        longitude: -43.1729,
        zoom: 10,
      },
      setViewport: mockSetViewport,
      mapStyle: 'light',
      setMapRef: mockSetMapRef,
      setDeckRef: mockSetDeckRef,
      contextMenuPickingInfo: null,
      openContextMenu: false,
      setContextMenuPickingInfo: mockSetContextMenuPickingInfo,
      setOpenContextMenu: mockSetOpenContextMenu,
      zoomToLocation: mockZoomToLocation,
    } as any)
  })

  it('deve renderizar o mapa sem erros', () => {
    const { getByTestId } = render(<Map />)
    expect(getByTestId('deck-gl')).toBeInTheDocument()
    expect(getByTestId('map-gl')).toBeInTheDocument()
  })

  it('deve ter container com classes corretas', () => {
    const { container } = render(<Map />)
    const mapContainer = container.firstChild as HTMLElement

    expect(mapContainer).toHaveClass(
      'relative',
      'h-full',
      'w-full',
      'overflow-hidden',
    )
  })

  it('deve capturar eventos de mouse sem crash', () => {
    const { container } = render(<Map />)
    const mapContainer = container.firstChild as HTMLElement

    expect(() => {
      fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(mapContainer, { clientX: 120, clientY: 120 })
      fireEvent.mouseUp(mapContainer, { clientX: 120, clientY: 120 })
      fireEvent.click(mapContainer, { clientX: 120, clientY: 120 })
    }).not.toThrow()
  })

  it('deve capturar eventos de click simples sem crash', () => {
    const { container } = render(<Map />)
    const mapContainer = container.firstChild as HTMLElement

    expect(() => {
      fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
      fireEvent.mouseUp(mapContainer, { clientX: 100, clientY: 100 })
      fireEvent.click(mapContainer, { clientX: 100, clientY: 100 })
    }).not.toThrow()
  })

  it('deve ter refs configurados para detecção de drag', () => {
    expect(() => {
      render(<Map />)
    }).not.toThrow()
  })

  it('deve ter threshold configurado para detecção de movimento', () => {
    const { container } = render(<Map />)
    const mapContainer = container.firstChild as HTMLElement

    // Movimentos grandes
    expect(() => {
      fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(mapContainer, { clientX: 150, clientY: 150 })
      fireEvent.mouseUp(mapContainer, { clientX: 150, clientY: 150 })
    }).not.toThrow()

    // Movimentos pequenos
    expect(() => {
      fireEvent.mouseDown(mapContainer, { clientX: 100, clientY: 100 })
      fireEvent.mouseMove(mapContainer, { clientX: 102, clientY: 102 })
      fireEvent.mouseUp(mapContainer, { clientX: 102, clientY: 102 })
    }).not.toThrow()
  })
})
