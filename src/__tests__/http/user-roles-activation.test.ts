import { deactivateUser } from '@/http/user-roles/deactivate-user'
import {
  DEACTIVATION_REASON_LABELS,
  MANUAL_DEACTIVATION_REASONS,
} from '@/http/user-roles/deactivation-reasons'
import { getDeactivationPreview } from '@/http/user-roles/get-deactivation-preview'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'
import { getUsersWithRoles } from '@/http/user-roles/get-users-with-roles'
import { reactivateUser } from '@/http/user-roles/reactivate-user'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn(), patch: jest.fn() },
}))

describe('user-roles activation http', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.get as jest.Mock).mockResolvedValue({ data: [] })
  })

  it('sends status to /users-roles only when informed', async () => {
    await getUsersWithRoles({ page: 1, size: 10 })
    expect(api.get).toHaveBeenLastCalledWith('/users-roles', {
      params: { page: 1, page_size: 10 },
    })

    await getUsersWithRoles({
      page: 2,
      size: 10,
      search: 'ana',
      status: 'inactive',
    })
    expect(api.get).toHaveBeenLastCalledWith('/users-roles', {
      params: { page: 2, page_size: 10, search: 'ana', status: 'inactive' },
    })
  })

  it('sends role and status to /users-roles/assigned', async () => {
    await getUsersOnlyWithRoles()
    expect(api.get).toHaveBeenLastCalledWith('/users-roles/assigned', {
      params: undefined,
    })

    await getUsersOnlyWithRoles({ role: 'Adjunto', status: 'all' })
    expect(api.get).toHaveBeenLastCalledWith('/users-roles/assigned', {
      params: { role: 'Adjunto', status: 'all' },
    })
  })

  it('deactivates with reason and trimmed note', async () => {
    const out = { id: 'u/1', is_active: false }
    ;(api.patch as jest.Mock).mockResolvedValue({ data: out })

    await expect(
      deactivateUser({ userId: 'u/1', reason: 'OUTRO', note: '  saiu  ' }),
    ).resolves.toEqual(out)

    expect(api.patch).toHaveBeenCalledWith('/users-roles/u%2F1/deactivate', {
      reason: 'OUTRO',
      note: 'saiu',
    })
  })

  it('omits an empty note', async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({ data: {} })
    await deactivateUser({ userId: 'u1', reason: 'DESLIGAMENTO', note: '   ' })
    expect(api.patch).toHaveBeenCalledWith('/users-roles/u1/deactivate', {
      reason: 'DESLIGAMENTO',
    })
  })

  it('sends the transfer target', async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({ data: {} })
    await deactivateUser({
      userId: 'u1',
      reason: 'DESLIGAMENTO',
      transferToUserId: 'u2',
    })
    expect(api.patch).toHaveBeenCalledWith('/users-roles/u1/deactivate', {
      reason: 'DESLIGAMENTO',
      transfer_to_user_id: 'u2',
    })
  })

  it('loads the deactivation preview', async () => {
    const preview = { sole_open_tickets: 1, shared_open_tickets: 0, teams: [] }
    ;(api.get as jest.Mock).mockResolvedValue({ data: preview })
    await expect(getDeactivationPreview('u/1')).resolves.toEqual(preview)
    expect(api.get).toHaveBeenCalledWith(
      '/users-roles/u%2F1/deactivation-preview',
    )
  })

  it('reactivates', async () => {
    ;(api.patch as jest.Mock).mockResolvedValue({ data: { is_active: true } })
    await reactivateUser('u1')
    expect(api.patch).toHaveBeenCalledWith('/users-roles/u1/reactivate')
  })

  it('offers only manual reasons, all labeled', () => {
    expect(MANUAL_DEACTIVATION_REASONS).toEqual([
      'DESLIGAMENTO',
      'TRANSFERENCIA',
      'AFASTAMENTO_TEMPORARIO',
      'BLOQUEIO_ADMINISTRATIVO',
      'OUTRO',
    ])
    for (const reason of MANUAL_DEACTIVATION_REASONS) {
      expect(DEACTIVATION_REASON_LABELS[reason]).toBeTruthy()
    }
    expect(
      DEACTIVATION_REASON_LABELS.BLOQUEIO_AUTOMATICO_RATE_LIMIT,
    ).toBeTruthy()
  })
})
