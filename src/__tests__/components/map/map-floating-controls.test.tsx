import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { MapFloatingControls } from '@/app/(app)/veiculos/components/map/components/map-floating-controls'
import { MapContextProvider } from '@/contexts/map-context'
import { useMapStore } from '@/stores/use-map-store'
import { getMapStyle, MapStyle } from '@/utils/get-map-style'

jest.mock('@/hooks/mapLayers/use-radar-layer', () => ({
  useRadarLayer: () => ({
    isVisible: true,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-cameras', () => ({
  useCamera: () => ({
    isVisible: true,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-fogo-cruzado', () => ({
  useFogoCruzadoIncidents: () => ({
    isVisible: false,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-AISP-layer', () => ({
  useAISPLayer: () => ({
    isVisible: false,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-CISP-layer', () => ({
  useCISPLayer: () => ({
    isVisible: false,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-school-layer', () => ({
  useSchoolLayer: () => ({
    isVisible: false,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-bus-stop-layer', () => ({
  useBusStopLayer: () => ({
    isVisible: false,
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-trips', () => ({
  useTrips: () => ({
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-address-marker', () => ({
  useAddressMarker: () => ({
    data: null,
    layer: {},
  }),
}))

describe('MapFloatingControls', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    useMapStore.setState({
      mapStyle: MapStyle.Map,
      clusterMode: 'auto',
    })
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContextProvider>{children}</MapContextProvider>
    </QueryClientProvider>
  )

  it('renders cluster toggle active by default with cyan indicator and toggles to off', () => {
    render(<MapFloatingControls />, { wrapper: createWrapper })

    const clusterButton = screen.getByRole('button', {
      name: 'Agrupamento: automático',
    })
    expect(clusterButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('cluster-active-indicator')).toBeInTheDocument()
    expect(clusterButton.querySelectorAll('circle')).toHaveLength(3)

    fireEvent.click(clusterButton)

    const disabledClusterButton = screen.getByRole('button', {
      name: 'Agrupamento: desligado',
    })
    expect(disabledClusterButton).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.queryByTestId('cluster-active-indicator'),
    ).not.toBeInTheDocument()
    expect(disabledClusterButton.querySelectorAll('circle')).toHaveLength(5)
    expect(useMapStore.getState().clusterMode).toBe('off')
  })

  it('shows the currently active style thumbnail in collapsed state and cycles through Padrão, Satélite and Escuro on click', () => {
    render(<MapFloatingControls />, { wrapper: createWrapper })

    // Quando o mapa está em Padrão (Map), mostra a miniatura do estilo ativo (Padrão)
    const activeDefaultButton = screen.getByRole('button', {
      name: 'Estilo do mapa atual: Padrão (clique para Satélite)',
    })
    expect(activeDefaultButton).toHaveTextContent('Padrão')
    fireEvent.click(activeDefaultButton)
    expect(useMapStore.getState().mapStyle).toBe(MapStyle.Satellite)
    expect(getMapStyle(useMapStore.getState().mapStyle)).toBe(
      'mapbox://styles/mapbox/satellite-streets-v12',
    )

    // Agora o estilo ativo é Satélite, então o botão fechado mostra Satélite
    const activeSatelliteButton = screen.getByRole('button', {
      name: 'Estilo do mapa atual: Satélite (clique para Escuro)',
    })
    expect(activeSatelliteButton).toHaveTextContent('Satélite')
    fireEvent.click(activeSatelliteButton)
    expect(useMapStore.getState().mapStyle).toBe(MapStyle.Dark)
    expect(getMapStyle(useMapStore.getState().mapStyle)).toBe(
      'mapbox://styles/mapbox/dark-v11',
    )

    // Agora o estilo ativo é Escuro, então o botão fechado mostra Escuro
    const activeDarkButton = screen.getByRole('button', {
      name: 'Estilo do mapa atual: Escuro (clique para Padrão)',
    })
    expect(activeDarkButton).toHaveTextContent('Escuro')
    fireEvent.click(activeDarkButton)
    expect(useMapStore.getState().mapStyle).toBe(MapStyle.Map)
    expect(getMapStyle(useMapStore.getState().mapStyle)).toBe(
      'mapbox://styles/mapbox/streets-v12',
    )
  })

  it('expands the 3 style options on hover and allows direct selection of dark-v11', () => {
    render(<MapFloatingControls />, { wrapper: createWrapper })

    const collapsedButton = screen.getByRole('button', {
      name: 'Estilo do mapa atual: Padrão (clique para Satélite)',
    })
    fireEvent.mouseEnter(collapsedButton.parentElement!)

    expect(
      screen.getByRole('group', { name: 'Selecionar estilo do mapa' }),
    ).toBeInTheDocument()
    // O botão principal (72x72px) permanece montado na coluna para não alterar a altura no hover
    expect(
      screen.getByRole('button', {
        name: 'Estilo do mapa atual: Padrão (clique para Satélite)',
      }),
    ).toHaveAttribute('aria-expanded', 'true')

    const defaultBtn = screen.getByRole('button', {
      name: 'Estilo do mapa: Padrão',
    })
    const satelliteBtn = screen.getByRole('button', {
      name: 'Estilo do mapa: Satélite',
    })
    const darkBtn = screen.getByRole('button', {
      name: 'Estilo do mapa: Escuro',
    })

    expect(defaultBtn).toHaveAttribute('aria-pressed', 'true')
    expect(satelliteBtn).toHaveAttribute('aria-pressed', 'false')
    expect(darkBtn).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(darkBtn)
    expect(useMapStore.getState().mapStyle).toBe(MapStyle.Dark)
    expect(
      screen.getByRole('button', {
        name: 'Estilo do mapa atual: Escuro (clique para Padrão)',
      }),
    ).toHaveTextContent('Escuro')
  })
})
