import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'

import { GeocodedAddressMap } from '@/components/custom/geocoded-address-map'
import { useGeocodedMap } from '@/hooks/maps/use-geocoded-map'
import { searchAddress } from '@/http/mapbox/search-address'

const personAddress = {
  tipoLogradouro: 'Rua',
  logradouro: 'A',
  numeroLogradouro: '10',
  bairro: null,
  municipio: 'Rio de Janeiro',
  uf: 'RJ',
  cep: null,
}

const mockMap = {
  addControl: jest.fn(),
  remove: jest.fn(),
  on: jest.fn(),
}
const mockMarker = {
  addTo: jest.fn(),
  setLngLat: jest.fn(),
}
mockMarker.setLngLat.mockReturnValue(mockMarker)
const mockMapConstructor = jest.fn((options: unknown) => {
  if (!options) throw new Error('Map options are required')
  return mockMap
})

jest.mock('mapbox-gl', () => ({
  __esModule: true,
  default: {
    accessToken: '',
    Map: function (options: unknown) {
      return mockMapConstructor(options)
    },
    Marker: jest.fn(() => mockMarker),
    NavigationControl: jest.fn(),
  },
}))

jest.mock('@/http/mapbox/search-address', () => ({
  searchAddress: jest.fn(),
}))

const mockSearchAddress = jest.mocked(searchAddress)

const geocodedAddress: Awaited<ReturnType<typeof searchAddress>> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
      properties: {
        feature_type: 'address',
        coordinates: { accuracy: 'point' },
      },
    },
  ],
}

describe('useGeocodedMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchAddress.mockResolvedValue(geocodedAddress)
  })

  it('creates and removes the map instance for the current address', async () => {
    const container = document.createElement('div')
    const containerRef = { current: container }
    const { unmount } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )

    await waitFor(() => expect(mockMapConstructor).toHaveBeenCalledTimes(1))
    expect(mockMapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ container, center: [-43.2, -22.9] }),
    )
    expect(mockSearchAddress).toHaveBeenCalledWith({
      street: 'Rua A',
      addressNumber: '10',
      place: 'Rio de Janeiro',
      region: 'RJ',
    })
    expect(mockMap.addControl).toHaveBeenCalledTimes(1)
    expect(mockMarker.setLngLat).toHaveBeenCalledWith([-43.2, -22.9])
    expect(mockMarker.addTo).toHaveBeenCalledWith(mockMap)

    unmount()

    expect(mockMap.remove).toHaveBeenCalledTimes(1)
  })

  it('does not create a map when the async lookup resolves after unmount', async () => {
    let resolveSearch!: (
      value: Awaited<ReturnType<typeof searchAddress>>,
    ) => void
    mockSearchAddress.mockImplementation(
      () => new Promise((resolve) => (resolveSearch = resolve)),
    )
    const containerRef = { current: document.createElement('div') }
    const { unmount } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )

    unmount()
    await act(async () => resolveSearch(geocodedAddress))

    expect(mockMapConstructor).not.toHaveBeenCalled()
  })

  it('removes the previous map when the address changes', async () => {
    const containerRef = { current: document.createElement('div') }
    const { rerender } = renderHook(
      ({ address }) => useGeocodedMap(containerRef, address),
      { initialProps: { address: personAddress } },
    )

    await waitFor(() => expect(mockMapConstructor).toHaveBeenCalledTimes(1))
    rerender({ address: { ...personAddress, logradouro: 'B' } })

    await waitFor(() => expect(mockMapConstructor).toHaveBeenCalledTimes(2))
    expect(mockMap.remove).toHaveBeenCalledTimes(1)
  })

  it('keeps the current map when an equivalent address object is returned', async () => {
    const containerRef = { current: document.createElement('div') }
    const { rerender } = renderHook(
      ({ address }) => useGeocodedMap(containerRef, address),
      { initialProps: { address: personAddress } },
    )
    await waitFor(() => expect(mockMapConstructor).toHaveBeenCalledTimes(1))
    rerender({ address: { ...personAddress } })
    expect(mockSearchAddress).toHaveBeenCalledTimes(1)
    expect(mockMap.remove).not.toHaveBeenCalled()
  })

  it('ignores an outdated lookup when a newer address has already resolved', async () => {
    const pendingSearches: Array<
      (value: Awaited<ReturnType<typeof searchAddress>>) => void
    > = []
    mockSearchAddress.mockImplementation(
      () =>
        new Promise((resolve) => {
          pendingSearches.push(resolve)
        }),
    )
    const containerRef = { current: document.createElement('div') }
    const { rerender } = renderHook(
      ({ address }) => useGeocodedMap(containerRef, address),
      { initialProps: { address: personAddress } },
    )

    rerender({ address: { ...personAddress, logradouro: 'Nova' } })
    await act(async () => pendingSearches[1](geocodedAddress))

    expect(mockMapConstructor).toHaveBeenCalledTimes(1)
    rerender({ address: { ...personAddress, logradouro: 'Nova atualizada' } })
    await act(async () => pendingSearches[0](geocodedAddress))

    expect(mockMapConstructor).toHaveBeenCalledTimes(1)
  })

  it('reports unavailable addresses without creating a map', async () => {
    mockSearchAddress.mockResolvedValue({ features: [] } as unknown as Awaited<
      ReturnType<typeof searchAddress>
    >)
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )

    await waitFor(() => expect(result.current.hasMapError).toBe(true))
    expect(result.current.error).toBe('address-not-found')
    expect(mockMapConstructor).not.toHaveBeenCalled()
  })

  it('reports geocoding failures without creating a map', async () => {
    mockSearchAddress.mockRejectedValue(new Error('Geocoding unavailable'))
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )

    await waitFor(() => expect(result.current.hasMapError).toBe(true))
    expect(result.current.error).toBe('search-failed')
    expect(mockMapConstructor).not.toHaveBeenCalled()
  })
  it('uses the approximate coordinates supplied for a person without geocoding again', async () => {
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, {
        ...personAddress,
        latitudeAproximadaLocal: -22.9,
        longitudeAproximadaLocal: -43.2,
      }),
    )
    await waitFor(() => expect(mockMapConstructor).toHaveBeenCalledTimes(1))
    expect(mockMapConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ center: [-43.2, -22.9] }),
    )
    expect(mockSearchAddress).not.toHaveBeenCalled()
    expect(result.current.isApproximateLocation).toBe(true)
  })

  it('labels an interpolated geocoding result as approximate', async () => {
    mockSearchAddress.mockResolvedValue({
      ...geocodedAddress,
      features: [
        {
          ...geocodedAddress.features[0],
          properties: {
            feature_type: 'address',
            coordinates: { accuracy: 'interpolated' },
          },
        },
      ],
    })
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )
    await waitFor(() => expect(result.current.isApproximateLocation).toBe(true))
  })

  it('distinguishes a confirmed street from a confirmed house number', async () => {
    mockSearchAddress.mockResolvedValue({
      ...geocodedAddress,
      features: [
        {
          ...geocodedAddress.features[0],
          properties: { feature_type: 'street' },
        },
      ],
    })
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )
    await waitFor(() => expect(result.current.approximation).toBe('street'))
    expect(result.current.isApproximateLocation).toBe(true)
  })

  it('reports a renderer failure separately from an address search failure', async () => {
    mockMapConstructor.mockImplementationOnce(() => {
      throw new Error('WebGL unavailable')
    })
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )
    await waitFor(() => expect(result.current.error).toBe('map-failed'))
  })

  it('reports style load failures and recovers when the map eventually loads', async () => {
    const containerRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useGeocodedMap(containerRef, personAddress),
    )
    await waitFor(() =>
      expect(mockMap.on).toHaveBeenCalledWith('error', expect.any(Function)),
    )
    act(() => mockMap.on.mock.calls.find(([event]) => event === 'error')?.[1]())
    expect(result.current.error).toBe('map-failed')
    act(() => mockMap.on.mock.calls.find(([event]) => event === 'load')?.[1]())
    expect(result.current.error).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('mounts the real map container and discloses street precision only after loading', async () => {
    mockSearchAddress.mockResolvedValue({
      ...geocodedAddress,
      features: [
        {
          ...geocodedAddress.features[0],
          properties: { feature_type: 'street' },
        },
      ],
    })
    render(<GeocodedAddressMap address={personAddress} />)
    expect(screen.getByRole('status')).toHaveTextContent('Localizando endereço')
    await waitFor(() =>
      expect(mockMap.on).toHaveBeenCalledWith('load', expect.any(Function)),
    )
    act(() => mockMap.on.mock.calls.find(([event]) => event === 'load')?.[1]())
    expect(screen.getByRole('status')).toHaveTextContent(
      'Localização aproximada da rua. O número do imóvel não foi confirmado.',
    )
    expect(
      screen.queryByText('Localizando endereço...'),
    ).not.toBeInTheDocument()
  })

  it('shows address not found separately from a request failure in the component', async () => {
    mockSearchAddress.mockResolvedValue({
      type: 'FeatureCollection',
      features: [],
    })
    const { unmount } = render(<GeocodedAddressMap address={personAddress} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Endereço não encontrado no mapa.',
    )
    unmount()
    mockSearchAddress.mockRejectedValue(new Error('Network unavailable'))
    render(<GeocodedAddressMap address={personAddress} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível consultar a localização.',
    )
  })

  it.each([
    [null, null],
    [0, 0],
    [null, -22.9],
    [Infinity, -22.9],
    [-43.2, 91],
  ])(
    'falls back to structured geocoding for unavailable or invalid coordinates %s, %s',
    async (longitude, latitude) => {
      const containerRef = { current: document.createElement('div') }
      renderHook(() =>
        useGeocodedMap(containerRef, {
          ...personAddress,
          longitudeAproximadaLocal: longitude,
          latitudeAproximadaLocal: latitude,
        }),
      )
      await waitFor(() => expect(mockSearchAddress).toHaveBeenCalledTimes(1))
      expect(mockMapConstructor).toHaveBeenCalledTimes(1)
    },
  )
})
