import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen } from '@testing-library/react'

import { ProfileAccessTable } from '@/app/(app)/demandas/perfis/components/profile-access-table'
import { useProfileAccessSearchParams } from '@/hooks/useParams/useProfileAccessSearchParams'
import {
  getUsersWithRoles,
  type UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'

const push = jest.fn()
let currentSearch = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/demandas/perfis',
  useSearchParams: () => new URLSearchParams(currentSearch),
}))
jest.mock('@/http/user-roles/get-users-with-roles', () => ({
  getUsersWithRoles: jest.fn(),
}))

const mockedGetUsers = getUsersWithRoles as jest.Mock

const inactive: UserRoleListItem = {
  id: 'u2',
  username: 'bia',
  full_name: 'Bia Inativa',
  email: null,
  role: 'Agente',
  is_active: false,
  deactivated_at: '2026-11-20T15:00:00Z',
  deactivation_reason: 'DESLIGAMENTO',
}

function renderTable() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ProfileAccessTable onEditUser={jest.fn()} />
    </QueryClientProvider>,
  )
}

function pushedParams() {
  const url = push.mock.calls.at(-1)?.[0] as string
  return new URLSearchParams(url.split('?')[1])
}

beforeEach(() => {
  jest.clearAllMocks()
  currentSearch = ''
  mockedGetUsers.mockResolvedValue({ data: { items: [inactive], total: 1 } })
})

describe('profile list filters (URL)', () => {
  it.failing('reads role and reason from the URL', () => {
    currentSearch = 'status=inactive&role=Agente&reason=DESLIGAMENTO'
    const { result } = renderHook(() => useProfileAccessSearchParams())
    expect(result.current.formattedSearchParams).toEqual(
      expect.objectContaining({
        status: 'inactive',
        role: 'Agente',
        reason: 'DESLIGAMENTO',
      }),
    )
  })

  it.failing('maps the "Sem perfil" option to withoutRole', () => {
    currentSearch = 'role=none'
    const { result } = renderHook(() => useProfileAccessSearchParams())
    expect(result.current.formattedSearchParams).toEqual(
      expect.objectContaining({ withoutRole: true }),
    )
    expect(result.current.formattedSearchParams).not.toHaveProperty('role')
  })

  it.failing('changing a filter goes back to page 1', () => {
    currentSearch = 'page=3'
    const { result } = renderHook(() => useProfileAccessSearchParams())
    // @ts-expect-error handleFilterChange chega com os filtros novos
    act(() => result.current.handleFilterChange('role', 'Adjunto'))
    expect(pushedParams().get('role')).toBe('Adjunto')
    expect(pushedParams().get('page')).toBe('1')
  })

  it.failing('going back to active users drops the reason filter', () => {
    currentSearch = 'status=inactive&reason=DESLIGAMENTO'
    const { result } = renderHook(() => useProfileAccessSearchParams())
    act(() => result.current.handleStatusChange('active'))
    expect(pushedParams().has('reason')).toBe(false)
    expect(pushedParams().has('status')).toBe(false)
  })
})

describe('profile list table', () => {
  it.failing('uses dropdowns instead of status tabs', async () => {
    renderTable()
    await screen.findByText('Bia Inativa')
    expect(screen.queryByRole('tab')).toBeNull()
    expect(
      screen.getByRole('combobox', { name: 'Situação' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Perfil de acesso' }),
    ).toBeInTheDocument()
  })

  it.failing(
    'disables the reason filter while listing active users',
    async () => {
      renderTable()
      await screen.findByText('Bia Inativa')
      expect(
        screen.getByRole('combobox', { name: 'Motivo da desativação' }),
      ).toBeDisabled()
    },
  )

  it.failing(
    'shows reason and date as columns for inactive users',
    async () => {
      currentSearch = 'status=inactive'
      renderTable()
      await screen.findByText('Bia Inativa')
      expect(screen.getByText('MOTIVO')).toBeInTheDocument()
      expect(screen.getByText('DESATIVADO EM')).toBeInTheDocument()
      expect(screen.getByText('Desligamento')).toBeInTheDocument()
      expect(screen.getByText('20/11/2026')).toBeInTheDocument()
    },
  )

  it('hides the deactivation columns for active users', async () => {
    mockedGetUsers.mockResolvedValue({
      data: {
        items: [{ ...inactive, is_active: true, deactivation_reason: null }],
        total: 1,
      },
    })
    renderTable()
    await screen.findByText('Bia Inativa')
    expect(screen.queryByText('MOTIVO')).toBeNull()
    expect(screen.queryByText('DESATIVADO EM')).toBeNull()
  })
})
