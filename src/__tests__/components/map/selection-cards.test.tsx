import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { SelectionCards } from '@/app/(app)/veiculos/components/map/components/select-cards'

// Mock the map size hook
jest.mock('@/hooks/use-map-size', () => ({
  useMapSize: jest.fn(() => ({
    width: 1200,
    height: 800,
  })),
}))

// Mock the Zustand store
jest.mock('@/stores/use-map-store', () => ({
  useMapStore: jest.fn((selector) => {
    const mockState = {
      multipleSelectedRadars: [],
      radarInfoMode: null,
      setRadarInfoMode: jest.fn(),
    }
    return selector(mockState)
  }),
}))

// Mock the layer hooks
jest.mock('@/app/(app)/veiculos/components/map/hooks/layers/use-cameras', () => ({
  useCameraCOR: jest.fn(() => ({
    selectedObject: null,
    setSelectedObject: jest.fn(),
    data: [],
    layer: {},
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/layers/use-radar-layer', () => ({
  useRadarLayer: jest.fn(() => ({
    selectedObject: null,
    setSelectedObject: jest.fn(),
    data: [],
    layer: {},
  })),
}))

jest.mock('@/app/(app)/veiculos/components/map/hooks/layers/use-fogo-cruzado', () => ({
  useFogoCruzadoIncidents: jest.fn(() => ({
    selectedObject: null,
    setSelectedObject: jest.fn(),
    data: [],
    layer: {},
  })),
}))

// Mock the select card components
jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards/camera-select-card',
  () => ({
    CameraSelectCard: ({ selectedObject, setSelectedObject, className }: any) => (
      <div data-testid="camera-select-card" className={className}>
        Camera: {selectedObject ? 'selected' : 'not selected'}
        <button onClick={() => setSelectedObject(null)}>Close Camera</button>
      </div>
    ),
  }),
)

jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards/radar-select-card',
  () => ({
    RadarSelectCard: ({ selectedObject, setSelectedObject, infoMode, className }: any) => (
      <div data-testid="radar-select-card" className={className}>
        Radar: {selectedObject ? 'selected' : 'not selected'}
        {infoMode && <span data-testid="info-mode">Info Mode</span>}
        <button onClick={() => setSelectedObject(null)}>Close Radar</button>
      </div>
    ),
  }),
)

jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards/fogo-cruzado-select-card',
  () => ({
    FogoCruzadoSelectCard: ({ selectedObject, setSelectedObject }: any) => (
      <div data-testid="fogo-cruzado-select-card">
        FogoCruzado: {selectedObject ? 'selected' : 'not selected'}
        <button onClick={() => setSelectedObject(null)}>
          Close FogoCruzado
        </button>
      </div>
    ),
  }),
)

describe('SelectionCards', () => {
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

  it('should render without errors', () => {
    render(<SelectionCards />, { wrapper: createWrapper })
    
    expect(screen.getByTestId('camera-select-card')).toBeInTheDocument()
    expect(screen.getAllByTestId('radar-select-card')).toHaveLength(2)
    expect(screen.getByTestId('fogo-cruzado-select-card')).toBeInTheDocument()
  })

  it('should display "selected" state when objects are selected', () => {
    const { useCameraCOR } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-cameras')
    const { useRadarLayer } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-radar-layer')
    const { useFogoCruzadoIncidents } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-fogo-cruzado')

    useCameraCOR.mockReturnValue({
      selectedObject: { id: 'camera1' },
      setSelectedObject: jest.fn(),
    })

    useRadarLayer.mockReturnValue({
      selectedObject: { id: 'radar1' },
      setSelectedObject: jest.fn(),
    })

    useFogoCruzadoIncidents.mockReturnValue({
      selectedObject: { id: 'fogo1' },
      setSelectedObject: jest.fn(),
    })

    render(<SelectionCards />, { wrapper: createWrapper })

    expect(screen.getByText('Camera: selected')).toBeInTheDocument()
    expect(screen.getByText('Radar: selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: selected')).toBeInTheDocument()
  })

  it('should display "not selected" state when no objects are selected', () => {
    const { useCameraCOR } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-cameras')
    const { useRadarLayer } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-radar-layer')
    const { useFogoCruzadoIncidents } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-fogo-cruzado')

    // Reset mocks to return null/undefined selected objects
    useCameraCOR.mockReturnValue({
      selectedObject: null,
      setSelectedObject: jest.fn(),
      data: [],
      layer: {},
    })

    useRadarLayer.mockReturnValue({
      selectedObject: null,
      setSelectedObject: jest.fn(),
      data: [],
      layer: {},
    })

    useFogoCruzadoIncidents.mockReturnValue({
      selectedObject: null,
      setSelectedObject: jest.fn(),
      data: [],
      layer: {},
    })

    render(<SelectionCards />, { wrapper: createWrapper })

    expect(screen.getByText('Camera: not selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: not selected')).toBeInTheDocument()
  })

  it('should render radar info mode card', () => {
    render(<SelectionCards />, { wrapper: createWrapper })
    
    const radarCards = screen.getAllByTestId('radar-select-card')
    expect(radarCards).toHaveLength(2)
    
    // One should be the info mode card
    expect(screen.getByTestId('info-mode')).toBeInTheDocument()
  })

  it('should apply margin top class for small screen widths', () => {
    const { useMapSize } = require('@/hooks/use-map-size')
    
    useMapSize.mockReturnValue({
      width: 1000, // Less than 1060
      height: 800,
    })

    render(<SelectionCards />, { wrapper: createWrapper })
    
    const cameraCard = screen.getByTestId('camera-select-card')
    expect(cameraCard).toHaveClass('mt-12')
  })

  it('should not apply margin top class for large screen widths', () => {
    const { useMapSize } = require('@/hooks/use-map-size')
    
    useMapSize.mockReturnValue({
      width: 1200, // Greater than 1060
      height: 800,
    })

    render(<SelectionCards />, { wrapper: createWrapper })
    
    const cameraCard = screen.getByTestId('camera-select-card')
    expect(cameraCard).not.toHaveClass('mt-12')
  })

  it('deve lidar com valores undefined/null graciosamente', () => {
    const { useCameraCOR } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-cameras')
    const { useRadarLayer } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-radar-layer')
    const { useFogoCruzadoIncidents } = require('@/app/(app)/veiculos/components/map/hooks/layers/use-fogo-cruzado')

    useCameraCOR.mockReturnValue({
      selectedObject: null,
      setSelectedObject: jest.fn(),
    })

    useRadarLayer.mockReturnValue({
      selectedObject: undefined,
      setSelectedObject: jest.fn(),
    })

    useFogoCruzadoIncidents.mockReturnValue({
      selectedObject: null,
      setSelectedObject: jest.fn(),
    })

    expect(() => {
      render(<SelectionCards />, { wrapper: createWrapper })
    }).not.toThrow()

    expect(screen.getByText('Camera: not selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: not selected')).toBeInTheDocument()
  })

  it('deve renderizar corretamente com store vazio', () => {
    const { useMapStore } = require('@/stores/use-map-store')

    useMapStore.mockImplementation((selector) => {
      const mockState = {
        multipleSelectedRadars: [],
        radarInfoMode: null,
        setRadarInfoMode: jest.fn(),
      }
      return selector(mockState)
    })

    expect(() => {
      render(<SelectionCards />, { wrapper: createWrapper })
    }).not.toThrow()

    expect(screen.getByTestId('camera-select-card')).toBeInTheDocument()
    expect(screen.getAllByTestId('radar-select-card')).toHaveLength(2)
    expect(screen.getByTestId('fogo-cruzado-select-card')).toBeInTheDocument()
  })
})