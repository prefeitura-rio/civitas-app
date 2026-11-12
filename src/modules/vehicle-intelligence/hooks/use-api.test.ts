import { act, renderHook, waitFor } from '@testing-library/react'

import { useApi } from '@/modules/vehicle-intelligence/hooks/use-api'

/** Resposta mínima para o fetch falso: o ambiente jsdom do Jest não tem `Response`. */
const fakeResponse = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Map(Object.entries(headers)),
    text: async () => JSON.stringify(body),
    json: async () => body,
  }) as unknown as Response
const originalFetch = global.fetch
const json = (body: unknown, status = 200) =>
  fakeResponse(body, status, { 'Content-Type': 'application/json' })

let fetchMock: jest.Mock
beforeEach(() => {
  fetchMock = jest.fn()
  global.fetch = fetchMock as unknown as typeof fetch
})
afterEach(() => {
  global.fetch = originalFetch
})

// O recorte é lido da URL quando o módulo carrega (aqui, o padrão: transeuntes). O cache de lib/api vale para
// o módulo inteiro: cada teste usa caminhos próprios.
describe('useApi', () => {
  it('pede o caminho do recorte e entrega a resposta', async () => {
    fetchMock.mockResolvedValueOnce(json({ total: 3 }))
    const { result } = renderHook(() =>
      useApi<{ total: number }>('/api/v1/teste-a'),
    )
    await waitFor(() => expect(result.current.data).toEqual({ total: 3 }))
    expect(fetchMock.mock.calls[0][0]).toBe(
      '/api/bff-iv/api/transeuntes/v1/teste-a',
    )
    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      dataPath: '/api/v1/teste-a',
    })
  })

  it('caminho nulo não pede nada', () => {
    const { result } = renderHook(() => useApi(null))
    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current).toMatchObject({ data: null, loading: false })
  })

  it('mantém a resposta anterior enquanto a nova não chega', async () => {
    fetchMock.mockResolvedValueOnce(json({ page: 1 }))
    let resolveSecond: (value: Response) => void = () => undefined
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => (resolveSecond = resolve)),
    )
    const { result, rerender } = renderHook(
      ({ path }) => useApi<{ page: number }>(path),
      {
        initialProps: { path: '/api/v1/teste-b?p=1' },
      },
    )
    await waitFor(() => expect(result.current.data).toEqual({ page: 1 }))
    rerender({ path: '/api/v1/teste-b?p=2' })
    await waitFor(() => expect(result.current.loading).toBe(true))
    expect(result.current).toMatchObject({
      data: { page: 1 },
      dataPath: '/api/v1/teste-b?p=1',
    })
    await act(async () => resolveSecond(json({ page: 2 })))
    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: { page: 2 },
        dataPath: '/api/v1/teste-b?p=2',
      }),
    )
  })

  it('mostra o erro da API e tenta de novo com reload', async () => {
    fetchMock.mockResolvedValueOnce(json({ detail: 'Base indisponível' }, 503))
    fetchMock.mockResolvedValueOnce(json({ ok: true }))
    const { result } = renderHook(() => useApi('/api/v1/teste-c'))
    await waitFor(() => expect(result.current.error).toBe('Base indisponível'))
    act(() => result.current.reload())
    await waitFor(() =>
      expect(result.current).toMatchObject({ data: { ok: true }, error: null }),
    )
  })

  it('espera o atraso e pede só o último caminho', async () => {
    jest.useFakeTimers()
    try {
      fetchMock.mockResolvedValue(json({ ok: true }))
      const { rerender } = renderHook(
        ({ path }) => useApi(path, { delayMs: 180 }),
        {
          initialProps: { path: '/api/v1/teste-d?x=1' },
        },
      )
      rerender({ path: '/api/v1/teste-d?x=2' })
      rerender({ path: '/api/v1/teste-d?x=3' })
      await act(async () => jest.advanceTimersByTimeAsync(200))
      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock.mock.calls[0][0]).toBe(
        '/api/bff-iv/api/transeuntes/v1/teste-d?x=3',
      )
    } finally {
      jest.useRealTimers()
    }
  })

  it('uma resposta em cache aparece sem passar por carregando', async () => {
    fetchMock.mockResolvedValueOnce(json({ cached: true }))
    const first = renderHook(() => useApi('/api/v1/teste-e'))
    await waitFor(() =>
      expect(first.result.current.data).toEqual({ cached: true }),
    )
    const second = renderHook(() => useApi('/api/v1/teste-e'))
    expect(second.result.current).toMatchObject({
      data: { cached: true },
      loading: false,
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
