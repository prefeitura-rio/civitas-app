import { render, screen } from '@testing-library/react'

import { SelectionCards } from '@/app/(app)/veiculos/components/map/components/select-cards'
import { useMap } from '@/hooks/useContexts/use-map-context'

jest.mock('@/hooks/useContexts/use-map-context', () => ({
  useMap: jest.fn(),
}))

const mockUseMap = jest.mocked(useMap)

jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards/camera-select-card',
  () => ({
    CameraSelectCard: ({ selectedObject, setSelectedObject }: any) => (
      <div data-testid="camera-select-card">
        Camera: {selectedObject ? 'selected' : 'not selected'}
        <button onClick={() => setSelectedObject(null)}>Close Camera</button>
      </div>
    ),
  }),
)

jest.mock(
  '@/app/(app)/veiculos/components/map/components/select-cards/radar-select-card',
  () => ({
    RadarSelectCard: ({ selectedObject, setSelectedObject }: any) => (
      <div data-testid="radar-select-card">
        Radar: {selectedObject ? 'selected' : 'not selected'}
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
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseMap.mockReturnValue({
      layers: {
        cameras: {
          selectedObject: null,
          handleSelectObject: jest.fn(),
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
        radars: {
          selectedObject: null,
          setSelectedObject: jest.fn(),
          data: [],
          layer: null,
          hoveredObject: null,
          setHoveredObject: jest.fn(),
          handleSelectObject: jest.fn(),
          clearSelection: jest.fn(),
        },
        fogoCruzado: {
          selectedObject: null,
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
      },
    } as any)
  })

  it('should render without errors', () => {
    render(<SelectionCards />)
    expect(screen.getByTestId('camera-select-card')).toBeInTheDocument()
    expect(screen.getByTestId('radar-select-card')).toBeInTheDocument()
    expect(screen.getByTestId('fogo-cruzado-select-card')).toBeInTheDocument()
  })

  it('should display "selected" state when objects are selected', () => {
    mockUseMap.mockReturnValue({
      layers: {
        cameras: {
          selectedObject: {
            code: 'CAM123',
            location: 'Test Location',
            zone: 'Test Zone',
            latitude: -22.9068,
            longitude: -43.1729,
            streamingUrl: 'http://test.com',
          },
          handleSelectObject: jest.fn(),
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
        radars: {
          selectedObject: {
            cetRioCode: 'RDR123',
            latitude: -22.9068,
            longitude: -43.1729,
            location: 'Test Location',
            district: 'Test District',
            company: 'Test Company',
            isActive24h: true,
            lastDetectionTime: new Date(),
            streetName: 'Test Street',
            hasData: true,
            direction: 'Test Direction',
            lane: 'Test Lane',
            streetNumber: '123',
          },
          setSelectedObject: jest.fn(),
          data: [],
          layer: null,
          hoveredObject: null,
          setHoveredObject: jest.fn(),
          handleSelectObject: jest.fn(),
          clearSelection: jest.fn(),
        },
        fogoCruzado: {
          selectedObject: {
            id: 'FC123',
            documentNumber: 'DOC123',
            address: 'Test Address',
            state: 'RJ',
            region: 'Test Region',
            latitude: -22.9068,
            longitude: -43.1729,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            type: 'test',
            description: 'Test Description',
            priority: 'high',
            assignedTo: 'Test User',
            estimatedResolutionTime: new Date(),
            actualResolutionTime: new Date(),
            resolutionNotes: 'Test Notes',
            attachments: [],
            tags: [],
          },
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
      },
    } as any)

    render(<SelectionCards />)

    expect(screen.getByText('Camera: selected')).toBeInTheDocument()
    expect(screen.getByText('Radar: selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: selected')).toBeInTheDocument()
  })

  it('should display "not selected" state when objects are not selected', () => {
    render(<SelectionCards />)

    expect(screen.getByText('Camera: not selected')).toBeInTheDocument()
    expect(screen.getByText('Radar: not selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: not selected')).toBeInTheDocument()
  })

  it('should pass correct props to CameraSelectCard', () => {
    render(<SelectionCards />)

    expect(screen.getByTestId('camera-select-card')).toBeInTheDocument()
  })

  it('should pass correct props to RadarSelectCard', () => {
    render(<SelectionCards />)

    expect(screen.getByTestId('radar-select-card')).toBeInTheDocument()
  })

  it('should pass correct props to FogoCruzadoSelectCard', () => {
    render(<SelectionCards />)

    expect(screen.getByTestId('fogo-cruzado-select-card')).toBeInTheDocument()
  })

  it('should handle undefined/null values gracefully', () => {
    mockUseMap.mockReturnValue({
      layers: {
        cameras: {
          selectedObject: null,
          handleSelectObject: jest.fn(),
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
        radars: {
          selectedObject: null,
          setSelectedObject: jest.fn(),
          data: [],
          layer: null,
          hoveredObject: null,
          setHoveredObject: jest.fn(),
          handleSelectObject: jest.fn(),
          clearSelection: jest.fn(),
        },
        fogoCruzado: {
          selectedObject: null,
          setSelectedObject: jest.fn(),
          data: [],
          failed: false,
          layer: null,
          isLoading: false,
          error: null,
          refetch: jest.fn(),
          isFetching: false,
          isError: false,
        },
      },
    } as any)

    render(<SelectionCards />)

    expect(screen.getByText('Camera: not selected')).toBeInTheDocument()
    expect(screen.getByText('Radar: not selected')).toBeInTheDocument()
    expect(screen.getByText('FogoCruzado: not selected')).toBeInTheDocument()
  })
})
