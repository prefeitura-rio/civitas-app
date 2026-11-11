import type { MasterGraphOptions } from '@/modules/vehicle-intelligence/types/domain'

/** Os limites da interface dependem da estratégia do recorte, lida da URL quando o módulo carrega. */
async function loadWith(recorte: string) {
  window.history.replaceState(null, '', `/?recorte=${recorte}`)
  jest.resetModules()
  return import('@/modules/vehicle-intelligence/features/correlations/query')
}

const options = (published: Partial<MasterGraphOptions>) =>
  published as MasterGraphOptions

describe('consulta ajustada às opções da base', () => {
  it('mantém janela e raio publicados', async () => {
    const { DEFAULT_QUERY, fitToOptions } = await loadWith('transeuntes')
    const query = { ...DEFAULT_QUERY, eventWindow: 20, radius: 600 }
    const fitted = fitToOptions(
      query,
      options({
        available_event_window_minutes: [10, 20],
        available_radius_meters: [600],
      }),
    )
    expect([fitted.eventWindow, fitted.radius]).toEqual([20, 600])
  })

  it('leva o que a base não publica ao maior valor oferecido', async () => {
    const { DEFAULT_QUERY, fitToOptions } = await loadWith('transeuntes')
    const query = { ...DEFAULT_QUERY, eventWindow: 30, radius: 1000 }
    const fitted = fitToOptions(
      query,
      options({
        available_event_window_minutes: [10, 20],
        available_radius_meters: [300, 600],
      }),
    )
    expect([fitted.eventWindow, fitted.radius]).toEqual([20, 600])
  })

  it('sem as opções, vale o que a interface oferece; copassagem não tem raio', async () => {
    const { DEFAULT_QUERY, fitToOptions } = await loadWith('carga')
    const fitted = fitToOptions(
      { ...DEFAULT_QUERY, passageWindow: 7, radius: 123 },
      null,
    )
    expect([fitted.passageWindow, fitted.radius]).toEqual([20, 123])
  })
})
