import {
  cachedResponse,
  dashboardPath,
  request,
} from '@/modules/vehicle-intelligence/lib/api'

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

describe('cache das respostas', () => {
  afterEach(() => {
    global.fetch = originalFetch
  })

  /** Responde com um JSON de `chars` caracteres. */
  const serve = (chars: number) =>
    (global.fetch = jest.fn(async () =>
      fakeResponse({ texto: 'x'.repeat(chars - 12) }),
    ) as unknown as typeof fetch)

  it('tira as mais antigas quando o tamanho passa do teto, e a mais nova fica', async () => {
    serve(15_000_000)
    await request('/teto/a')
    await request('/teto/b')
    expect(cachedResponse('/teto/a')).not.toBeNull()
    await request('/teto/c')
    expect(cachedResponse('/teto/a')).toBeNull()
    expect(cachedResponse('/teto/b')).not.toBeNull()
    expect(cachedResponse('/teto/c')).not.toBeNull()
    serve(50_000_000)
    await request('/teto/enorme')
    expect(cachedResponse('/teto/b')).toBeNull()
    expect(cachedResponse('/teto/c')).toBeNull()
    expect(cachedResponse('/teto/enorme')).not.toBeNull()
  })

  it('devolve a resposta guardada sem pedir de novo', async () => {
    serve(100)
    const first = await request('/repetida')
    expect(await request('/repetida')).toBe(first)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})

describe('caminho do panorama', () => {
  it('repete cada filtro na ordem da API', () => {
    expect(
      dashboardPath({
        modalidades: ['ROUBO', 'FURTO'],
        alvos: ['CELULAR'],
        deslocamentos: ['MOTO'],
        cisps: ['014'],
      }),
    ).toBe(
      '/api/v1/dashboard?modalidade=ROUBO&modalidade=FURTO&alvo=CELULAR&deslocamento=MOTO&cisp=014',
    )
  })

  it('sem filtros, pede o recorte inteiro', () => {
    expect(
      dashboardPath({
        modalidades: [],
        alvos: [],
        deslocamentos: [],
        cisps: [],
      }),
    ).toBe('/api/v1/dashboard?')
  })
})
