import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useAISPLayer } from '@/hooks/mapLayers/use-AISP-layer'
import { useBusStopLayer } from '@/hooks/mapLayers/use-bus-stop-layer'
import { useCISPLayer } from '@/hooks/mapLayers/use-CISP-layer'
import { useSchoolLayer } from '@/hooks/mapLayers/use-school-layer'

jest.mock('@deck.gl/core', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/core/dist/index.cjs'),
)
jest.mock('@deck.gl/layers', () =>
  jest.requireActual('../../../../node_modules/@deck.gl/layers/dist/index.cjs'),
)

const cases = [
  ['schools', useSchoolLayer, 'Escolas_Municipais.geojson'],
  ['bus stops', useBusStopLayer, 'paradas_onibus.geojson'],
  ['AISP', useAISPLayer, 'AISP.geojson'],
  ['CISP', useCISPLayer, 'CISP.geojson'],
] as const

describe.each(cases)('%s lazy reference layer', (_name, useLayer, filename) => {
  let client: QueryClient
  let fetchMock: jest.Mock

  beforeEach(() => {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-43.2, -22.9] },
            properties: { name: 'Test', latitude: -22.9, longitude: -43.2 },
          },
        ],
      }),
    })
    global.fetch = fetchMock
  })

  afterEach(() => client.clear())

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  it('fetches only when activated and reuses successful results after toggling', async () => {
    const { result } = renderHook(() => useLayer(), { wrapper })
    expect(fetchMock).not.toHaveBeenCalled()
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    expect(fetchMock.mock.calls[0][0]).toContain(filename)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    if ('data' in result.current) {
      expect(result.current.data).toEqual([
        expect.objectContaining({ latitude: -22.9, longitude: -43.2 }),
      ])
    } else {
      expect(result.current.features.features).toHaveLength(1)
    }
    act(() => result.current.setIsVisible(false))
    act(() => result.current.setIsVisible(true))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cancels an unfinished request when hidden and retries on reactivation', async () => {
    fetchMock.mockImplementation(
      (_url, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    const { result } = renderHook(() => useLayer(), { wrapper })
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal
    act(() => result.current.setIsVisible(false))
    await waitFor(() => expect(signal.aborted).toBe(true))
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })

  it('exposes request errors and permits retry after toggling', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 })
    const { result } = renderHook(() => useLayer(), { wrapper })
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(result.current.isError).toBe(true))
    act(() => result.current.setIsVisible(false))
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(result.current.isError).toBe(false))
  })

  it('cancels an unfinished request on unmount', async () => {
    fetchMock.mockImplementation(
      (_url, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    const { result, unmount } = renderHook(() => useLayer(), { wrapper })
    act(() => result.current.setIsVisible(true))
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal
    unmount()
    await waitFor(() => expect(signal.aborted).toBe(true))
  })
})
