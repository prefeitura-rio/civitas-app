import { render, waitFor } from '@testing-library/react'

import { SessionActivityTracker } from '@/components/custom/session-activity-tracker'
import { redirectToSignIn } from '@/lib/session-redirect'

jest.mock('@/lib/session-redirect', () => ({ redirectToSignIn: jest.fn() }))

const originalFetch = global.fetch

function mockTouch(status: number, body: unknown) {
  const mock = jest.fn(async () => ({
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  }))
  global.fetch = mock as unknown as typeof fetch
  return mock
}

describe('SessionActivityTracker', () => {
  afterEach(() => {
    global.fetch = originalFetch
    jest.clearAllMocks()
  })

  it('encerra o login pelo fluxo comum, com o motivo, quando a sessão acabou', async () => {
    const mock = mockTouch(401, {
      authenticated: false,
      code: 'user_deactivated',
    })

    render(<SessionActivityTracker />)

    await waitFor(() =>
      expect(redirectToSignIn).toHaveBeenCalledWith('user_deactivated'),
    )
    expect(mock).toHaveBeenCalledWith(
      '/api/auth/session-touch',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('não mexe no login quando a sessão continua válida', async () => {
    const mock = mockTouch(200, { authenticated: true })

    render(<SessionActivityTracker />)

    await waitFor(() => expect(mock).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(redirectToSignIn).not.toHaveBeenCalled()
  })
})
