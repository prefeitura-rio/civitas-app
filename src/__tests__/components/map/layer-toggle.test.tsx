import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { MapLayerControl } from '@/app/(app)/veiculos/components/map/components/layer-toggle'
import { MapContextProvider } from '@/contexts/map-context'
import { POINT_CLUSTER_COLORS } from '@/utils/point-cluster-colors'

function rgb(color: [number, number, number, number]) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`
}

const mockToggleRadarOrigin = jest.fn()

jest.mock('@/hooks/mapLayers/use-radar-layer', () => ({
  useRadarLayer: () => ({
    isVisible: true, // Radar deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
    originCounts: [
      { origin: 'CETRIO', count: 1200 },
      { origin: 'CIVITAS', count: 30 },
    ],
    hiddenOrigins: new Set(['CIVITAS']),
    toggleOrigin: mockToggleRadarOrigin,
    showAllOrigins: jest.fn(),
  }),
}))

jest.mock('@/hooks/mapLayers/use-cameras', () => ({
  useCamera: () => ({
    isVisible: true, // Camada de câmeras deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
    originCounts: [],
    hiddenOrigins: new Set(),
    toggleOrigin: jest.fn(),
    showAllOrigins: jest.fn(),
  }),
}))

jest.mock('@/hooks/mapLayers/use-fogo-cruzado', () => ({
  useFogoCruzadoIncidents: () => ({
    isVisible: false, // Fogo Cruzado NÃO deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-AISP-layer', () => ({
  useAISPLayer: () => ({
    isVisible: false, // AISP NÃO deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-CISP-layer', () => ({
  useCISPLayer: () => ({
    isVisible: false, // CISP NÃO deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-school-layer', () => ({
  useSchoolLayer: () => ({
    isVisible: false, // Escolas NÃO deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-bus-stop-layer', () => ({
  useBusStopLayer: () => ({
    isVisible: false, // Paradas de ônibus NÃO deve estar visível por padrão
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

describe('MapLayerControl', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContextProvider>{children}</MapContextProvider>
    </QueryClientProvider>
  )

  it('should render layer control button', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    expect(screen.getByText('Camadas')).toBeInTheDocument()
  })

  it('uses cluster colors only when selected and keeps hover styling neutral', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })
    fireEvent.click(screen.getByText('Camadas'))

    const lprButton = screen.getByLabelText('Toggle LPR layer')
    expect(lprButton).toHaveStyle({
      backgroundColor: rgb(POINT_CLUSTER_COLORS.lpr),
      color: 'rgb(17, 24, 39)',
    })

    const busStopsButton = screen.getByLabelText(
      'Toggle Paradas de Ônibus layer',
    )
    expect(busStopsButton.style.backgroundColor).toBe('')
    expect(busStopsButton).toHaveClass('hover:bg-muted')
    expect(busStopsButton).toHaveClass('hover:text-muted-foreground')
    expect(busStopsButton).toHaveAttribute('data-state', 'off')
  })

  it('should show radar layer as selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de radar está selecionada por padrão
    const radarButton = screen.getByLabelText('Toggle LPR layer')
    expect(radarButton).toHaveAttribute('data-state', 'on')
    expect(radarButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should show cameras layer as selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de câmeras está selecionada por padrão
    const camerasButton = screen.getByLabelText('Toggle Câmeras layer')
    expect(camerasButton).toHaveAttribute('data-state', 'on')
    expect(camerasButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('should show fogo cruzado layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de fogo cruzado NÃO está selecionada por padrão
    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')
    expect(fogoCruzadoButton).toHaveAttribute('data-state', 'off')
    expect(fogoCruzadoButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show satellite layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de satélite NÃO está selecionada por padrão
    const satelliteButton = screen.getByLabelText('Toggle Satélite layer')
    expect(satelliteButton).toHaveAttribute('data-state', 'off')
    expect(satelliteButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show AISP layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de AISP NÃO está selecionada por padrão
    const aispButton = screen.getByLabelText('Toggle AISP layer')
    expect(aispButton).toHaveAttribute('data-state', 'off')
    expect(aispButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show CISP layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de CISP NÃO está selecionada por padrão
    const cispButton = screen.getByLabelText('Toggle CISP layer')
    expect(cispButton).toHaveAttribute('data-state', 'off')
    expect(cispButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show schools layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de escolas NÃO está selecionada por padrão
    const schoolsButton = screen.getByLabelText(
      'Toggle Escolas Municipais layer',
    )
    expect(schoolsButton).toHaveAttribute('data-state', 'off')
    expect(schoolsButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show bus stops layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de paradas de ônibus NÃO está selecionada por padrão
    const busStopsButton = screen.getByLabelText(
      'Toggle Paradas de Ônibus layer',
    )
    expect(busStopsButton).toHaveAttribute('data-state', 'off')
    expect(busStopsButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show all layer options when opened', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se todas as camadas estão presentes
    expect(screen.getByLabelText('Toggle LPR layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Câmeras layer')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Toggle Fogo Cruzado layer'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Satélite layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle AISP layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle CISP layer')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Toggle Escolas Municipais layer'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Toggle Paradas de Ônibus layer'),
    ).toBeInTheDocument()
  })

  it('should display correct layer names', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se os nomes das camadas estão corretos
    expect(screen.getByText('LPR')).toBeInTheDocument()
    expect(screen.getByText('Câmeras')).toBeInTheDocument()
    expect(screen.getByText('Fogo Cruzado')).toBeInTheDocument()
    expect(screen.getByText('Satélite')).toBeInTheDocument()
    expect(screen.getByText('AISP')).toBeInTheDocument()
    expect(screen.getByText('CISP')).toBeInTheDocument()
    expect(screen.getByText('Escolas Municipais')).toBeInTheDocument()
    expect(screen.getByText('Paradas de Ônibus')).toBeInTheDocument()
  })

  it('should have correct styling for selected layers', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se as camadas selecionadas têm a classe correta
    const radarButton = screen.getByLabelText('Toggle LPR layer')
    const camerasButton = screen.getByLabelText('Toggle Câmeras layer')

    expect(radarButton).toHaveStyle({
      backgroundColor: rgb(POINT_CLUSTER_COLORS.lpr),
      color: 'rgb(17, 24, 39)',
    })
    expect(camerasButton).toHaveStyle({
      backgroundColor: rgb(POINT_CLUSTER_COLORS.cameras),
      color: 'rgb(255, 255, 255)',
    })
  })

  it('should have correct styling for unselected layers', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se as camadas não selecionadas têm a classe correta
    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')

    expect(fogoCruzadoButton).toHaveAttribute('data-state', 'off')
  })

  it('lists origins with counts and toggles them from the layer filter', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })
    fireEvent.click(screen.getByText('Camadas'))

    expect(
      screen.queryByLabelText('Filtrar Câmeras por origem'),
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Filtrar LPR por origem (1 oculta)'))

    const cetrio = screen.getByRole('button', { name: /CETRIO/ })
    const civitas = screen.getByRole('button', { name: /CIVITAS/ })
    expect(cetrio).toHaveAttribute('aria-pressed', 'true')
    expect(cetrio).toHaveTextContent('1.200')
    expect(civitas).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Mostrar todas')).toBeInTheDocument()

    fireEvent.click(civitas)
    expect(mockToggleRadarOrigin).toHaveBeenCalledWith('CIVITAS')
  })

  it('should ensure only radar and cameras are selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica que apenas Radar e Câmeras estão selecionados
    const selectedLayers = screen.getAllByRole('button', { pressed: true })
    expect(selectedLayers).toHaveLength(2)

    const selectedLayerNames = selectedLayers.map((button) =>
      button.getAttribute('aria-label'),
    )
    expect(selectedLayerNames).toContain('Toggle LPR layer')
    expect(selectedLayerNames).toContain('Toggle Câmeras layer')
  })
})
