import { redirectToSignIn } from '@/lib/session-redirect'
import { getGeneralReportStatus } from '@/modules/vehicle-intelligence/features/reports/api'

jest.mock('@/lib/session-redirect', () => ({ redirectToSignIn: jest.fn() }))

/** Resposta mínima para o fetch falso: o ambiente jsdom do Jest não tem `Response`. */
const fakeResponse = (
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: new Map(Object.entries(headers)),
    json: async () => body,
  }) as unknown as Response
const originalFetch = global.fetch

describe('relatórios: sessão encerrada', () => {
  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('volta ao login sem mostrar erro quando o BFF encerra a sessão', async () => {
    global.fetch = jest.fn(async () =>
      fakeResponse({ code: 'user_deactivated' }, 401, {
        'x-civitas-session-ended': '1',
      }),
    ) as unknown as typeof fetch

    const settled = jest.fn()
    getGeneralReportStatus().then(settled, settled)
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(redirectToSignIn).toHaveBeenCalledWith('user_deactivated')
    expect(settled).not.toHaveBeenCalled()
  })

  it('mostra o erro da API nos demais casos', async () => {
    global.fetch = jest.fn(async () =>
      fakeResponse({ detail: 'Falhou' }, 500),
    ) as unknown as typeof fetch

    await expect(getGeneralReportStatus()).rejects.toThrow('Falhou')
    expect(redirectToSignIn).not.toHaveBeenCalled()
  })
})
