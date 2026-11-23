import { readFileSync } from 'node:fs'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Feature, FeatureCollection } from 'geojson'

import { SearchBox } from '@/app/(app)/veiculos/components/map/components/search-box'
import { getPlaces } from '@/http/mapbox/get-places'
import { getReversePlaces } from '@/http/mapbox/get-reverse-places'
import type { Camera, CollectionPoint } from '@/models/entities'

jest.mock('@/http/mapbox/get-places', () => ({
  getPlaces: jest.fn(),
}))
jest.mock('@/http/mapbox/get-reverse-places', () => ({
  getReversePlaces: jest.fn(),
}))

const mockGetPlaces = getPlaces as jest.MockedFunction<typeof getPlaces>

describe('SearchBox', () => {
  const originalFetch = global.fetch
  beforeAll(() => {
    const boundaries = JSON.parse(
      readFileSync(
        'public/vehicle-intelligence/data/bairros_rio.geojson',
        'utf8',
      ),
    )
    global.fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, json: async () => boundaries })
  })
  afterAll(() => {
    global.fetch = originalFetch
  })
  let queryClient: QueryClient
  const mockSetAddressMarker = jest.fn()
  const mockSetIsVisible = jest.fn()
  const mockSetViewport = jest.fn()
  const mockSetEquipmentHighlight = jest.fn()
  const defaultPlaceholder = 'Pesquise um endereço, equipamento ou coordenadas'

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

  const mockSuggestions: Feature[] = [
    {
      type: 'Feature',
      properties: {
        full_address: 'Avenida Rio Branco, Centro, Rio de Janeiro, Brazil',
        coordinates: {
          latitude: -22.9068,
          longitude: -43.1729,
        },
      },
      geometry: {
        type: 'Point',
        coordinates: [-43.1729, -22.9068],
      },
    },
    {
      type: 'Feature',
      properties: {
        full_address: 'Rua da Assembleia, Centro, Rio de Janeiro, Brazil',
        coordinates: {
          latitude: -22.9069,
          longitude: -43.173,
        },
      },
      geometry: {
        type: 'Point',
        coordinates: [-43.173, -22.9069],
      },
    },
  ]

  const equipment: CollectionPoint = {
    cetRioCode: '0002573',
    equipmentCodes: ['9876'],
    codigoPontoColeta: '5432',
    company: 'CETRIO',
    location: 'Rua do equipamento',
    latitude: -22.9,
    longitude: -43.2,
    district: null,
    direction: null,
    lane: null,
    lastDetectionTime: null,
    activeInLast24Hours: true,
  }

  it('queries the final address only after 400 ms without typing', async () => {
    jest.useFakeTimers()
    mockGetPlaces.mockResolvedValue({
      type: 'FeatureCollection',
      features: mockSuggestions,
    })
    const { unmount } = render(
      <SearchBox
        isVisible={false}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )
    try {
      const input = screen.getByPlaceholderText(defaultPlaceholder)
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'Rua' } })
      act(() => jest.advanceTimersByTime(200))
      fireEvent.change(input, { target: { value: 'Rua da Assembleia' } })
      await act(async () => {
        jest.advanceTimersByTime(399)
      })
      expect(mockGetPlaces).not.toHaveBeenCalled()
      await act(async () => {
        jest.advanceTimersByTime(1)
      })
      expect(mockGetPlaces).toHaveBeenCalledTimes(1)
      expect(mockGetPlaces).toHaveBeenCalledWith(
        'Rua da Assembleia',
        expect.any(Array),
      )
      expect(
        screen.getByText(mockSuggestions[0].properties!.full_address),
      ).toBeVisible()
      fireEvent.change(input, { target: { value: 'Rua nova' } })
      expect(
        screen.queryByText(mockSuggestions[0].properties!.full_address),
      ).not.toBeInTheDocument()
      fireEvent.change(input, { target: { value: '' } })
      await act(async () => {
        jest.advanceTimersByTime(400)
      })
      expect(mockGetPlaces).toHaveBeenCalledTimes(1)
    } finally {
      unmount()
      jest.useRealTimers()
    }
  })

  it('removes filtered equipment from suggestions and clears its circle', () => {
    const hidden = { ...equipment, company: 'CIVITAS' }
    const radars = [equipment, hidden]
    const props = {
      isVisible: false,
      setAddressMarker: mockSetAddressMarker,
      setIsVisible: mockSetIsVisible,
      setViewport: mockSetViewport,
      setEquipmentHighlight: mockSetEquipmentHighlight,
      radars,
      visibleCameras: [],
    }
    const { rerender } = render(
      <SearchBox {...props} visibleRadars={radars} />,
      { wrapper: createWrapper },
    )
    const input = screen.getByPlaceholderText(defaultPlaceholder)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '2573' } })
    expect(screen.getByText('Equipamentos (2)')).toBeVisible()
    mockSetEquipmentHighlight.mockClear()
    rerender(<SearchBox {...props} visibleRadars={[equipment]} />)
    expect(screen.getByText('Equipamentos (1)')).toBeVisible()
    expect(
      screen.queryByRole('button', { name: /CIVITAS/ }),
    ).not.toBeInTheDocument()
    expect(mockSetEquipmentHighlight).toHaveBeenCalledWith(null)
    rerender(<SearchBox {...props} visibleRadars={[]} />)
    expect(
      screen.queryByRole('group', { name: 'Equipamentos encontrados' }),
    ).not.toBeInTheDocument()
    expect(mockSetViewport).not.toHaveBeenCalled()
  })

  it.each([1, 2])(
    'lists all %i equipment matches and opens the chosen location',
    async (count) => {
      const radars = Array.from({ length: count }, (_, index) => ({
        ...equipment,
        company: index === 0 ? 'CETRIO' : 'CIVITAS',
        latitude: equipment.latitude + index / 100,
      }))
      const onSubmit = jest.fn()
      render(
        <SearchBox
          isVisible={false}
          setAddressMarker={mockSetAddressMarker}
          setIsVisible={mockSetIsVisible}
          setViewport={mockSetViewport}
          radars={radars}
          onSubmit={onSubmit}
          setEquipmentHighlight={mockSetEquipmentHighlight}
        />,
        { wrapper: createWrapper },
      )
      const input = screen.getByPlaceholderText(defaultPlaceholder)
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: '2573' } })
      expect(screen.getByText(`Equipamentos (${count})`)).toBeVisible()
      const options = screen.getAllByRole('button')
      expect(options).toHaveLength(count)
      fireEvent.submit(input.closest('form')!)
      await waitFor(() => expect(onSubmit).not.toHaveBeenCalled())
      expect(mockSetViewport).not.toHaveBeenCalled()
      fireEvent.click(options[count - 1])
      expect(mockSetViewport).toHaveBeenCalledWith({
        zoom: 20,
        longitude: radars[count - 1].longitude,
        latitude: radars[count - 1].latitude,
      })
      expect(mockGetPlaces).not.toHaveBeenCalled()
      expect(mockSetAddressMarker).toHaveBeenCalledWith(null)
      expect(mockSetAddressMarker).toHaveBeenCalledTimes(1)
      expect(mockSetIsVisible).toHaveBeenCalledWith(false)
      expect(mockSetEquipmentHighlight).toHaveBeenCalledWith({
        longitude: radars[count - 1].longitude,
        latitude: radars[count - 1].latitude,
      })
      fireEvent.change(input, { target: { value: '2573' } })
      expect(screen.getByText(`Equipamentos (${count})`)).toBeVisible()
    },
  )

  it.each(['00009876', '5432'])(
    'does not list equipment matching only an alternate code %s',
    (query) => {
      mockGetPlaces.mockResolvedValue({
        type: 'FeatureCollection',
        features: [],
      })
      render(
        <SearchBox
          isVisible={false}
          setAddressMarker={mockSetAddressMarker}
          setIsVisible={mockSetIsVisible}
          setViewport={mockSetViewport}
          radars={[equipment]}
        />,
        { wrapper: createWrapper },
      )
      const input = screen.getByPlaceholderText(defaultPlaceholder)
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: query } })
      expect(
        screen.queryByRole('group', { name: 'Equipamentos encontrados' }),
      ).not.toBeInTheDocument()
    },
  )

  it.each(['3', '0003'])(
    'matches only the full code, ignoring leading zeroes: %s',
    (query) => {
      const radars = ['0003', '123', '00023', '2239', '0002031', '0002238'].map(
        (code) => ({
          ...equipment,
          cetRioCode: code,
          codigoPontoColeta: code === '0002238' ? '0003' : null,
          equipmentCodes: code === '0002031' ? ['3'] : [],
        }),
      )
      render(
        <SearchBox
          isVisible={false}
          setAddressMarker={mockSetAddressMarker}
          setIsVisible={mockSetIsVisible}
          setViewport={mockSetViewport}
          radars={radars}
        />,
        { wrapper: createWrapper },
      )
      const input = screen.getByPlaceholderText(defaultPlaceholder)
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: query } })
      expect(screen.getByText('Equipamentos (1)')).toBeVisible()
      expect(screen.getByText('0003 · LPR · CETRIO')).toBeVisible()
      expect(
        screen.queryByRole('button', { name: /123/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /00023/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /2239/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /0002031/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /0002238/ }),
      ).not.toBeInTheDocument()

      fireEvent.change(input, { target: { value: '0023' } })
      expect(screen.getByText('Equipamentos (1)')).toBeVisible()
      expect(screen.getByText('00023 · LPR · CETRIO')).toBeVisible()
      expect(
        screen.queryByRole('button', { name: /123/ }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: /0003/ }),
      ).not.toBeInTheDocument()
    },
  )

  it('includes cameras sharing the equipment number', () => {
    const camera: Camera = {
      code: '2573',
      location: 'Câmera da avenida',
      latitude: -22.95,
      longitude: -43.25,
      zone: '',
      streamingUrl: '',
      sistemaOrigem: 'TIXI',
    }
    render(
      <SearchBox
        isVisible={false}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
        radars={[equipment]}
        cameras={[camera]}
        setEquipmentHighlight={mockSetEquipmentHighlight}
      />,
      { wrapper: createWrapper },
    )
    const input = screen.getByPlaceholderText(defaultPlaceholder)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '2573' } })
    expect(screen.getByText('Equipamentos (2)')).toBeVisible()
    fireEvent.click(
      screen.getByRole('button', { name: /2573 · Câmera · TIXI/ }),
    )
    expect(mockSetViewport).toHaveBeenCalledWith({
      zoom: 20,
      longitude: camera.longitude,
      latitude: camera.latitude,
    })
    expect(mockSetAddressMarker).toHaveBeenCalledWith(null)
    expect(mockSetEquipmentHighlight).toHaveBeenCalledWith({
      longitude: camera.longitude,
      latitude: camera.latitude,
    })
  })

  it.each(['-22.808889, -43.413889', '-22.883, -43.103'])(
    'rejects coordinates outside Rio: %s',
    async (query) => {
      render(
        <SearchBox
          isVisible={false}
          setAddressMarker={mockSetAddressMarker}
          setIsVisible={mockSetIsVisible}
          setViewport={mockSetViewport}
        />,
        { wrapper: createWrapper },
      )
      const input = screen.getByPlaceholderText(defaultPlaceholder)
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: query } })
      expect(await screen.findByRole('status')).toHaveTextContent(
        'Informe coordenadas dentro do município do Rio de Janeiro.',
      )
      expect(getReversePlaces).not.toHaveBeenCalled()
      expect(mockSetAddressMarker).not.toHaveBeenCalled()
      expect(mockSetViewport).not.toHaveBeenCalled()
    },
  )

  it('filters addresses in neighboring cities even inside the bounding box', async () => {
    mockGetPlaces.mockResolvedValue({
      type: 'FeatureCollection',
      features: [
        mockSuggestions[0],
        {
          ...mockSuggestions[0],
          properties: {
            full_address: 'Endereço em Nilópolis',
            coordinates: { longitude: -43.413889, latitude: -22.808889 },
          },
        },
      ],
    })
    render(
      <SearchBox
        isVisible={false}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
      />,
      { wrapper: createWrapper },
    )
    const input = screen.getByPlaceholderText(defaultPlaceholder)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Endereço' } })
    expect(
      await screen.findByText(mockSuggestions[0].properties!.full_address),
    ).toBeVisible()
    expect(screen.queryByText('Endereço em Nilópolis')).not.toBeInTheDocument()
    expect(mockGetPlaces).toHaveBeenCalledWith(
      'Endereço',
      expect.arrayContaining([expect.any(Number)]),
    )
  })

  it('places a pin for coordinates and clears the equipment circle', async () => {
    jest.mocked(getReversePlaces).mockResolvedValue({
      type: 'FeatureCollection',
      features: mockSuggestions,
    })
    render(
      <SearchBox
        isVisible={false}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
        setEquipmentHighlight={mockSetEquipmentHighlight}
      />,
      { wrapper: createWrapper },
    )
    const input = screen.getByPlaceholderText(defaultPlaceholder)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: '-22.906800, -43.172900' } })
    fireEvent.mouseDown(
      await screen.findByText(mockSuggestions[0].properties!.full_address),
    )
    expect(mockSetAddressMarker).toHaveBeenCalledWith({
      longitude: -43.1729,
      latitude: -22.9068,
    })
    expect(mockSetIsVisible).toHaveBeenCalledWith(true)
    expect(mockSetEquipmentHighlight).toHaveBeenCalledWith(null)
  })

  it('should render search input with placeholder', () => {
    render(
      <SearchBox
        isVisible={true}
        setAddressMarker={mockSetAddressMarker}
        setIsVisible={mockSetIsVisible}
        setViewport={mockSetViewport}
        placeHolder={defaultPlaceholder}
      />,
      { wrapper: createWrapper },
    )

    expect(screen.getByPlaceholderText(defaultPlaceholder)).toBeInTheDocument()
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

    const input = screen.getByPlaceholderText(defaultPlaceholder)

    // Foca no input para abrir as sugestões
    fireEvent.focus(input)

    // Digita algo para triggerar a busca
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      expect(
        screen.getByText('Avenida Rio Branco, Centro, Rio de Janeiro, Brazil'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Lat: -22.906800, Lon: -43.172900'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Rua da Assembleia, Centro, Rio de Janeiro, Brazil'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Lat: -22.906900, Lon: -43.173000'),
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

    const input = screen.getByPlaceholderText(defaultPlaceholder)

    // Foca no input para abrir as sugestões
    fireEvent.focus(input)

    // Digita algo para triggerar a busca
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      const firstSuggestion = screen.getByText(
        'Avenida Rio Branco, Centro, Rio de Janeiro, Brazil',
      )
      fireEvent.mouseDown(firstSuggestion)
    })

    // Verifica se setViewport foi chamado com as coordenadas corretas
    expect(mockSetViewport).toHaveBeenCalledWith({
      zoom: 14.15,
      longitude: -43.1729,
      latitude: -22.9068,
    })

    // Verifica se setAddressMarker foi chamado com as coordenadas corretas
    expect(mockSetAddressMarker).toHaveBeenCalledWith({
      longitude: -43.1729,
      latitude: -22.9068,
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
            latitude: -22.906800123456,
            longitude: -43.172900654321,
          },
        },
        geometry: {
          type: 'Point',
          coordinates: [-43.172900654321, -22.906800123456],
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

    const input = screen.getByPlaceholderText(defaultPlaceholder)
    fireEvent.focus(input)
    await user.type(input, 'Test')

    await waitFor(() => {
      expect(
        screen.getByText('Lat: -22.906800, Lon: -43.172901'),
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

    const input = screen.getByPlaceholderText(defaultPlaceholder)
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

    const input = screen.getByPlaceholderText(defaultPlaceholder)
    const clearButton = screen.getByRole('button')

    fireEvent.focus(input)
    await user.type(input, 'Rua Cândida')

    await waitFor(() => {
      expect(
        screen.getByText('Lat: -22.906800, Lon: -43.172900'),
      ).toBeInTheDocument()
    })

    // Clica no botão X
    await user.click(clearButton)

    // Verifica se setIsVisible foi chamado com false
    expect(mockSetIsVisible).toHaveBeenCalledWith(false)
  })
})
