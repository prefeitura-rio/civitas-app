import { QueryClient } from '@tanstack/react-query'

import { invalidateUserActivationQueries } from '@/lib/user-activation-cache'

const affected = [
  ['users-with-roles', { page: 1, size: 10, status: 'active' }],
  ['users-with-assigned-roles', 'chamados-impersonation'],
  ['users-with-assigned-roles', 'Agente'],
  ['shift-closings-adjuncts'],
  ['teams'],
  ['teams', 'members', 'by-role', 'team-1'],
  ['ticket', 'ticket-1', 'cabecalho'],
]

const untouched = [
  ['users', 'me'],
  ['ticket', 'ticket-1', 'historico'],
  ['tickets-dashboard'],
]

describe('invalidateUserActivationQueries', () => {
  it('marks every user-dependent query as stale and leaves the rest alone', async () => {
    const client = new QueryClient()
    for (const key of [...affected, ...untouched]) {
      client.setQueryData(key, { cached: true })
    }

    await invalidateUserActivationQueries(client)

    for (const key of affected) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(true)
    }
    for (const key of untouched) {
      expect(client.getQueryState(key)?.isInvalidated).toBe(false)
    }
  })
})
