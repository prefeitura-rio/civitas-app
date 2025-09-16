import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { MapLayerControl } from '@/app/(app)/veiculos/components/map/components/layer-toggle'
import { MapContextProvider } from '@/contexts/map-context'

jest.mock('@/hooks/mapLayers/use-radar-layer', () => ({
  useRadarLayer: () => ({
    isVisible: true, // Radar deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-cameras', () => ({
  useCameraCOR: () => ({
    isVisible: true, // Camada de câmeras deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-agents', () => ({
  useAgents: () => ({
    isVisible: false, // Agentes NÃO deve estar visível por padrão
    setIsVisible: jest.fn(),
    data: [],
    layer: {},
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

jest.mock('@/hooks/mapLayers/use-waze-police-alerts', () => ({
  useWazePoliceAlerts: () => ({
    isVisible: false, // Waze NÃO deve estar visível por padrão
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

  it('should show radar layer as selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de radar está selecionada por padrão
    const radarButton = screen.getByLabelText('Toggle Radar layer')
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

  it('should show agents layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de agentes NÃO está selecionada por padrão
    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    expect(agentsButton).toHaveAttribute('data-state', 'off')
    expect(agentsButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('should show waze layer as NOT selected by default', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se a camada de waze NÃO está selecionada por padrão
    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')
    expect(wazeButton).toHaveAttribute('data-state', 'off')
    expect(wazeButton).toHaveAttribute('aria-pressed', 'false')
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
    expect(screen.getByLabelText('Toggle Radar layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Câmeras layer')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle Agentes layer')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Toggle Policiamento (Waze) layer'),
    ).toBeInTheDocument()
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
    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(screen.getByText('Câmeras')).toBeInTheDocument()
    expect(screen.getByText('Agentes')).toBeInTheDocument()
    expect(screen.getByText('Policiamento (Waze)')).toBeInTheDocument()
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
    const radarButton = screen.getByLabelText('Toggle Radar layer')
    const camerasButton = screen.getByLabelText('Toggle Câmeras layer')

    expect(radarButton).toHaveClass('data-[state=on]:bg-primary')
    expect(radarButton).toHaveClass('data-[state=on]:text-primary-foreground')
    expect(camerasButton).toHaveClass('data-[state=on]:bg-primary')
    expect(camerasButton).toHaveClass('data-[state=on]:text-primary-foreground')
  })

  it('should have correct styling for unselected layers', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Clica no botão para abrir o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Verifica se as camadas não selecionadas têm a classe correta
    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')

    expect(agentsButton).toHaveAttribute('data-state', 'off')
    expect(wazeButton).toHaveAttribute('data-state', 'off')
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
    expect(selectedLayerNames).toContain('Toggle Radar layer')
    expect(selectedLayerNames).toContain('Toggle Câmeras layer')
  })
})
