/**
 * @jest-environment node
 */
import { signInAction } from '@/app/auth/sign-in/actions'

const cookieSet = jest.fn()

jest.mock('next/headers', () => ({
  cookies: () => ({ set: cookieSet, get: jest.fn() }),
}))

function form() {
  const data = new FormData()
  data.set('username', 'user')
  data.set('password', 'pass')
  return data
}

function mockLoginResponse(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: async () => body,
  }) as unknown as typeof fetch
}

describe('signInAction', () => {
  afterEach(() => {
    jest.restoreAllMocks()
    cookieSet.mockReset()
  })

  it('explains that the user was deactivated', async () => {
    mockLoginResponse(403, { code: 'user_deactivated' })

    const result = await signInAction(form())

    expect(result.success).toBe(false)
    expect(result.message).toBe(
      'Seu acesso foi desativado. Procure a coordenação.',
    )
    expect(cookieSet).not.toHaveBeenCalled()
  })

  it('keeps the generic message for wrong credentials', async () => {
    mockLoginResponse(401, { detail: 'invalid' })

    const result = await signInAction(form())

    expect(result.message).toBe('Credenciais inválidas')
  })
})
