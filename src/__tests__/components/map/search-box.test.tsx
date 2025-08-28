import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Feature, FeatureCollection } from 'geojson'

import { SearchBox } from '@/app/(app)/veiculos/components/map/components/search-box'
import { getPlaces } from '@/http/mapbox/get-places'

// Mock da função getPlaces
jest.mock('@/http/mapbox/get-places', () => ({
  getPlaces: jest.fn(),
}))

const mockGetPlaces = getPlaces as jest.MockedFunction<typeof getPlaces>

describe('SearchBox', () => {
  let queryClient: QueryClient
  const mockSetAddressMarker = jest.fn()
  const mockSetIsVisible = jest.fn()
  const mockSetViewport = jest.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    // Reset dos mocks
    jest.clearAllMocks()
  })

  const createWrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockSuggestions: Feature[] = [
    {
      type: 'Feature',
      properties: {
        full_address:
          'Rua Cândida, Paiol, Nilópolis - Rio de Janeiro, 26545-150, Brazil',
        coordinates: {
          latitude: -22.808889,
          longitude: -43.413889,
        },
      },
      geometry: {
        type: 'Point',
        coordinates: [-43.413889, -22.808889],
      },
    },
    {
      type: 'Feature',
      properties: {
        full_address:
          'Rua Cândida, Cabuís II, Nilópolis - Rio de Janeiro, 26545-150, Brazil',
        coordinates: {
          latitude: -22.809123,
          longitude: -43.414567,
        },
      },
      geometry: {
        type: 'Point',
        coordinates: [-43.414567, -22.809123],
      },
    },
  ]

  it('should render search input with placeholder', () => {
    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
        placeHolder="Pesquise um endereço"
      />,
      { wrapper: createWrapper },
    )

    expect(
      screen.getByPlaceholderText('Pesquise um endereço'),
    ).toBeInTheDocument()
  })

  it('should display suggestions with latitude and longitude when typing', async () => {
    const user = userEvent.setup()
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: mockSuggestions,
    }
    mockGetPlaces.mockResolvedValue(mockResponse)

    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )

    const input = screen.getByPlaceholderText('Pesquise um endereço')

    // Foca no input para abrir as sugestões
    fireEvent.focus(input)

    // Digita algo para triggerar a busca
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      expect(
        screen.getByText(
          'Rua Cândida, Paiol, Nilópolis - Rio de Janeiro, 26545-150, Brazil',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Lat: -22.808889, Lon: -43.413889'),
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          'Rua Cândida, Cabuís II, Nilópolis - Rio de Janeiro, 26545-150, Brazil',
        ),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Lat: -22.809123, Lon: -43.414567'),
      ).toBeInTheDocument()
    })
  })

  it('should call setViewport and setAddressMarker with correct coordinates when selecting a suggestion', async () => {
    const user = userEvent.setup()
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: mockSuggestions,
    }
    mockGetPlaces.mockResolvedValue(mockResponse)

    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )

    const input = screen.getByPlaceholderText('Pesquise um endereço')

    // Foca no input para abrir as sugestões
    fireEvent.focus(input)

    // Digita algo para triggerar a busca
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      const firstSuggestion = screen.getByText(
        'Rua Cândida, Paiol, Nilópolis - Rio de Janeiro, 26545-150, Brazil',
      )
      fireEvent.mouseDown(firstSuggestion)
    })

    // Verifica se setViewport foi chamado com as coordenadas corretas
    expect(mockSetViewport).toHaveBeenCalledWith({
      zoom: 14.15,
      longitude: -43.413889,
      latitude: -22.808889,
    })

    // Verifica se setAddressMarker foi chamado com as coordenadas corretas
    expect(mockSetAddressMarker).toHaveBeenCalledWith({
      longitude: -43.413889,
      latitude: -22.808889,
    })

    // Verifica se setIsVisible foi chamado
    expect(mockSetIsVisible).toHaveBeenCalledWith(true)
  })

  it('should format coordinates with 6 decimal places', async () => {
    const user = userEvent.setup()
    const mockSuggestionsWithLongDecimals: Feature[] = [
      {
        type: 'Feature',
        properties: {
          full_address: 'Test Address',
          coordinates: {
            latitude: -22.808889123456,
            longitude: -43.413889654321,
          },
        },
        geometry: {
          type: 'Point',
          coordinates: [-43.413889654321, -22.808889123456],
        },
      },
    ]

    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: mockSuggestionsWithLongDecimals,
    }
    mockGetPlaces.mockResolvedValue(mockResponse)

    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )

    const input = screen.getByPlaceholderText('Pesquise um endereço')
    fireEvent.focus(input)
    await user.type(input, 'Test')

    await waitFor(() => {
      expect(
        screen.getByText('Lat: -22.808889, Lon: -43.413890'),
      ).toBeInTheDocument()
    })
  })

  it('should handle empty suggestions gracefully', async () => {
    const user = userEvent.setup()
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    }
    mockGetPlaces.mockResolvedValue(mockResponse)

    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )

    const input = screen.getByPlaceholderText('Pesquise um endereço')
    fireEvent.focus(input)
    await user.type(input, 'NonExistentAddress')

    await waitFor(() => {
      // Não deve mostrar nenhuma sugestão
      expect(screen.queryByText(/Lat:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/Lon:/)).not.toBeInTheDocument()
    })
  })

  it('should clear suggestions when clicking X button', async () => {
    const user = userEvent.setup()
    const mockResponse: FeatureCollection = {
      type: 'FeatureCollection',
      features: mockSuggestions,
    }
    mockGetPlaces.mockResolvedValue(mockResponse)

    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )

    const input = screen.getByPlaceholderText('Pesquise um endereço')
    const clearButton = screen.getByRole('button')

    fireEvent.focus(input)
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      expect(
        screen.getByText('Lat: -22.808889, Lon: -43.413889'),
      ).toBeInTheDocument()
    })

    // Clica no botão X
    await user.click(clearButton)

    // Verifica se setIsVisible foi chamado com false
    expect(mockSetIsVisible).toHaveBeenCalledWith(false)
  })
})
