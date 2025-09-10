import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { MapLayerControl } from '@/app/(app)/veiculos/components/map/components/layer-toggle'
import { MapContextProvider } from '@/contexts/map-context'

const mockSetIsRadarVisible = jest.fn()
const mockSetIsCameraVisible = jest.fn()
const mockSetIsAgentsVisible = jest.fn()
const mockSetIsWazeVisible = jest.fn()
const mockSetIsFogoCruzadoVisible = jest.fn()
const mockSetIsAISPVisible = jest.fn()
const mockSetIsCISPVisible = jest.fn()
const mockSetIsSchoolsVisible = jest.fn()
const mockSetIsBusStopsVisible = jest.fn()

jest.mock('@/hooks/mapLayers/use-radar-layer', () => ({
  useRadarLayer: () => ({
    isVisible: true,
    setIsVisible: mockSetIsRadarVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-cameras', () => ({
  useCameraCOR: () => ({
    isVisible: true,
    setIsVisible: mockSetIsCameraVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-agents', () => ({
  useAgents: () => ({
    isVisible: false,
    setIsVisible: mockSetIsAgentsVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-fogo-cruzado', () => ({
  useFogoCruzadoIncidents: () => ({
    isVisible: false,
    setIsVisible: mockSetIsFogoCruzadoVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-waze-police-alerts', () => ({
  useWazePoliceAlerts: () => ({
    isVisible: false,
    setIsVisible: mockSetIsWazeVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-AISP-layer', () => ({
  useAISPLayer: () => ({
    isVisible: false,
    setIsVisible: mockSetIsAISPVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-CISP-layer', () => ({
  useCISPLayer: () => ({
    isVisible: false,
    setIsVisible: mockSetIsCISPVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-school-layer', () => ({
  useSchoolLayer: () => ({
    isVisible: false,
    setIsVisible: mockSetIsSchoolsVisible,
    data: [],
    layer: {},
  }),
}))

jest.mock('@/hooks/mapLayers/use-bus-stop-layer', () => ({
  useBusStopLayer: () => ({
    isVisible: false,
    setIsVisible: mockSetIsBusStopsVisible,
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

    jest.clearAllMocks()
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapContextProvider>{children}</MapContextProvider>
    </QueryClientProvider>
  )

  it('should call setIsVisible when radar layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const radarButton = screen.getByLabelText('Toggle Radar layer')
    fireEvent.click(radarButton)

    await waitFor(() => {
      expect(mockSetIsRadarVisible).toHaveBeenCalledWith(false)
    })
  })

  it('should call setIsVisible when cameras layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const camerasButton = screen.getByLabelText('Toggle Câmeras layer')
    fireEvent.click(camerasButton)

    await waitFor(() => {
      expect(mockSetIsCameraVisible).toHaveBeenCalledWith(false)
    })
  })

  it('should call setIsVisible when agents layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    fireEvent.click(agentsButton)

    await waitFor(() => {
      expect(mockSetIsAgentsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when waze layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')
    fireEvent.click(wazeButton)

    await waitFor(() => {
      expect(mockSetIsWazeVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when fogo cruzado layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')
    fireEvent.click(fogoCruzadoButton)

    await waitFor(() => {
      expect(mockSetIsFogoCruzadoVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when AISP layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const aispButton = screen.getByLabelText('Toggle AISP layer')
    fireEvent.click(aispButton)

    await waitFor(() => {
      expect(mockSetIsAISPVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when CISP layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const cispButton = screen.getByLabelText('Toggle CISP layer')
    fireEvent.click(cispButton)

    await waitFor(() => {
      expect(mockSetIsCISPVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when schools layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const schoolsButton = screen.getByLabelText(
      'Toggle Escolas Municipais layer',
    )
    fireEvent.click(schoolsButton)

    await waitFor(() => {
      expect(mockSetIsSchoolsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should call setIsVisible when bus stops layer is toggled', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const busStopsButton = screen.getByLabelText(
      'Toggle Paradas de Ônibus layer',
    )
    fireEvent.click(busStopsButton)

    await waitFor(() => {
      expect(mockSetIsBusStopsVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should handle multiple layer toggles correctly', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

    const agentsButton = screen.getByLabelText('Toggle Agentes layer')
    const wazeButton = screen.getByLabelText('Toggle Policiamento (Waze) layer')
    const fogoCruzadoButton = screen.getByLabelText('Toggle Fogo Cruzado layer')

    fireEvent.click(agentsButton)
    fireEvent.click(wazeButton)
    fireEvent.click(fogoCruzadoButton)

    await waitFor(() => {
      expect(mockSetIsAgentsVisible).toHaveBeenCalledWith(true)
      expect(mockSetIsWazeVisible).toHaveBeenCalledWith(true)
      expect(mockSetIsFogoCruzadoVisible).toHaveBeenCalledWith(true)
    })
  })

  it('should maintain default state for radar and cameras on component mount', () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    expect(mockSetIsRadarVisible).not.toHaveBeenCalled()
    expect(mockSetIsCameraVisible).not.toHaveBeenCalled()
  })

  it('should verify that all layer toggle functions are properly connected', async () => {
    render(<MapLayerControl />, { wrapper: createWrapper })

    const button = screen.getByText('Camadas')
    fireEvent.click(button)

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

    for (const { button: buttonLabel, mock } of layerTests) {
      const layerButton = screen.getByLabelText(buttonLabel)
      fireEvent.click(layerButton)

      await waitFor(() => {
        expect(mock).toHaveBeenCalled()
      })
    }
  })
})
