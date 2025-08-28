import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { MapLayerControl } from '@/app/(app)/veiculos/components/map/components/layer-toggle'
import { MapContextProvider } from '@/contexts/map-context'

// Mock dos hooks de camadas com comportamento real
const mockSetIsRadarVisible = jest.fn()
const mockSetIsCameraVisible = jest.fn()
const mockSetIsAgentsVisible = jest.fn()
const mockSetIsWazeVisible = jest.fn()
const mockSetIsFogoCruzadoVisible = jest.fn()
const mockSetIsAISPVisible = jest.fn()
const mockSetIsCISPVisible = jest.fn()
const mockSetIsSchoolsVisible = jest.fn()
const mockSetIsBusStopsVisible = jest.fn()
const mockSetMapStyle = jest.fn()

jest.mock('@/hooks/map-layers/use-radar-layer', () => ({
  useRadarLayer: () => ({
    isVisible: true, // Radar deve estar visível por padrão
    setIsVisible: mockSetIsRadarVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-cameras', () => ({
  useCameraCOR: () => ({
    isVisible: true, // Camada de câmeras deve estar visível por padrão
    setIsVisible: mockSetIsCameraVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-agents', () => ({
  useAgents: () => ({
    isVisible: false, // Agentes NÃO deve estar visível por padrão
    setIsVisible: mockSetIsAgentsVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-fogo-cruzado', () => ({
  useFogoCruzadoIncidents: () => ({
    isVisible: false, // Fogo Cruzado NÃO deve estar visível por padrão
    setIsVisible: mockSetIsFogoCruzadoVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-waze-police-alerts', () => ({
  useWazePoliceAlerts: () => ({
    isVisible: false, // Waze NÃO deve estar visível por padrão
    setIsVisible: mockSetIsWazeVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-AISP-layer', () => ({
  useAISPLayer: () => ({
    isVisible: false, // AISP NÃO deve estar visível por padrão
    setIsVisible: mockSetIsAISPVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-CISP-layer', () => ({
  useCISPLayer: () => ({
    isVisible: false, // CISP NÃO deve estar visível por padrão
    setIsVisible: mockSetIsCISPVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-school-layer', () => ({
  useSchoolLayer: () => ({
    isVisible: false, // Escolas NÃO deve estar visível por padrão
    setIsVisible: mockSetIsSchoolsVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-bus-stop-layer', () => ({
  useBusStopLayer: () => ({
    isVisible: false, // Paradas de ônibus NÃO deve estar visível por padrão
    setIsVisible: mockSetIsBusStopsVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-trips', () => ({
  useTrips: () => ({
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/map-layers/use-address-marker', () => ({
  useAddressMarker: () => ({
    data: null,
    layer: {},
  }),
}))

describe('MapLayerControl Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Reset de todos os mocks
    jest.clearAllMocks()
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContextProvider>{children}</MapContextProvider>
    </QueryClientProvider>
  )

  it('should call setIsVisible when radar layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de radar
    const radarButton = screen.getByLabelText('Toggle Radar layer')
    fireEvent.click(radarButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsRadarVisible).toHaveBeenCalledWith(false)
    })
  })

  it('should call setIsVisible when cameras layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de câmeras
    const camerasButton = screen.getByLabelText('Toggle Câmeras layer')
    fireEvent.click(camerasButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsCameraVisible).toHaveBeenCalledWith(false)
    })
  })

  it('should call setIsVisible when agents layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de agentes
    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    fireEvent.click(agentsButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsAgentsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when waze layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de waze
    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')
    fireEvent.click(wazeButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsWazeVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when fogo cruzado layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de fogo cruzado
    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')
    fireEvent.click(fogoCruzadoButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsFogoCruzadoVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when AISP layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de AISP
    const aispButton = screen.getByLabelText('Toggle AISP layer')
    fireEvent.click(aispButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsAISPVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when CISP layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de CISP
    const cispButton = screen.getByLabelText('Toggle CISP layer')
    fireEvent.click(cispButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsCISPVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when schools layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de escolas
    const schoolsButton = screen.getByLabelText(
      'Toggle Escolas Municipais layer',
    )
    fireEvent.click(schoolsButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsSchoolsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when bus stops layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Clica na camada de paradas de ônibus
    const busStopsButton = screen.getByLabelText(
      'Toggle Paradas de Ônibus layer',
    )
    fireEvent.click(busStopsButton)

    // Verifica se a função setIsVisible foi chamada
    await waitFor(() => {
      expect(mockSetIsBusStopsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should handle multiple layer toggles correctly', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Habilita várias camadas
    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')
    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')

    fireEvent.click(agentsButton)
    fireEvent.click(wazeButton)
    fireEvent.click(fogoCruzadoButton)

    // Verifica se todas as funções foram chamadas corretamente
    await waitFor(() => {
      expect(mockSetIsAgentsVisible).toHaveBeenCalledWith(true)
      expect(mockSetIsWazeVisible).toHaveBeenCalledWith(true)
      expect(mockSetIsFogoCruzadoVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should maintain default state for radar and cameras on component mount', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Verifica que as funções de radar e câmeras NÃO foram chamadas no mount
    // porque elas já vêm habilitadas por padrão
    expect(mockSetIsRadarVisible).not.toHaveBeenCalled()
    expect(mockSetIsCameraVisible).not.toHaveBeenCalled()
  })

  it('should verify that all layer toggle functions are properly connected', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    // Abre o controle de camadas
    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    // Lista de todas as camadas para testar
    const layerTests = [
      { button: 'Toggle Radar layer', mock: mockSetIsRadarVisible },
      { button: 'Toggle Câmeras layer', mock: mockSetIsCameraVisible },
      { button: 'Toggle Agentes layer', mock: mockSetIsAgentsVisible },
      {
        button: 'Toggle Policiamento (Waze) layer',
        mock: mockSetIsWazeVisible,
      },
      {
        button: 'Toggle Fogo Cruzado layer',
        mock: mockSetIsFogoCruzadoVisible,
      },
      { button: 'Toggle AISP layer', mock: mockSetIsAISPVisible },
      { button: 'Toggle CISP layer', mock: mockSetIsCISPVisible },
      {
        button: 'Toggle Escolas Municipais layer',
        mock: mockSetIsSchoolsVisible,
      },
      {
        button: 'Toggle Paradas de Ônibus layer',
        mock: mockSetIsBusStopsVisible,
      },
    ]

    // Testa cada camada
    for (const { button: buttonLabel, mock } of layerTests) {
      const layerButton = screen.getByLabelText(buttonLabel)
      fireEvent.click(layerButton)

      await waitFor(() => {
        expect(mock).toHaveBeenCalled()
      })
    }
  })
})
