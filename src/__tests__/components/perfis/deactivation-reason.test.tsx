import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { ProfileAccessFormDialog } from '@/app/(app)/demandas/perfis/components/profile-access-form-dialog'
import { ProfileAccessTable } from '@/app/(app)/demandas/perfis/components/profile-access-table'
import { useOwnUserRole } from '@/hooks/useQueries/useOwnUserRole'
import { useProfile } from '@/hooks/useQueries/useProfile'
import { getUserActivation } from '@/http/user-roles/get-user-activation'
import {
  getUsersWithRoles,
  type UserRoleListItem,
} from '@/http/user-roles/get-users-with-roles'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/demandas/perfis',
  useSearchParams: () => new URLSearchParams('status=inactive'),
}))
jest.mock('@/hooks/useQueries/useOwnUserRole', () => ({
  useOwnUserRole: jest.fn(),
}))
jest.mock('@/hooks/useQueries/useProfile', () => ({ useProfile: jest.fn() }))
jest.mock('@/http/user-roles/update-user-roles', () => ({
  updateUserRoles: jest.fn(),
}))
jest.mock('@/http/user-roles/get-users-with-roles', () => ({
  getUsersWithRoles: jest.fn(),
}))
jest.mock('@/http/user-roles/get-user-activation', () => ({
  getUserActivation: jest.fn(),
}))

const mockedOwnRole = useOwnUserRole as jest.Mock
const mockedProfile = useProfile as jest.Mock
const mockedGetUsers = getUsersWithRoles as jest.Mock
const mockedGetActivation = getUserActivation as jest.Mock

const inactive: UserRoleListItem = {
  id: 'u1',
  username: 'bia',
  full_name: 'Bia Inativa',
  email: null,
  role: 'Agente',
  is_active: false,
  deactivated_at: '2026-11-20T15:00:00Z',
  deactivation_reason: 'AFASTAMENTO_TEMPORARIO',
}

const activation = {
  id: 'u1',
  is_active: false,
  deactivated_at: '2026-11-20T15:00:00Z',
  deactivated_by_id: 'c1',
  deactivated_by_name: 'Carla Coordenadora',
  deactivation_reason: 'AFASTAMENTO_TEMPORARIO',
  deactivation_note: 'Licença médica até janeiro',
  transferred_tickets: 0,
  removed_from_shared_tickets: 0,
  left_teams: [],
  previous_teams: [],
}

function withClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function renderDialog(user: UserRoleListItem = inactive) {
  withClient(
    <ProfileAccessFormDialog
      isOpen
      onOpen={jest.fn()}
      onClose={jest.fn()}
      dialogInitialData={user}
      setDialogInitialData={jest.fn()}
      onRequestActivationChange={jest.fn()}
    />,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedProfile.mockReturnValue({ data: { id: 'me', username: 'me' } })
  mockedOwnRole.mockReturnValue({ data: 'Coordenador' })
  mockedGetActivation.mockResolvedValue(activation)
  mockedGetUsers.mockResolvedValue({ data: { items: [inactive], total: 1 } })
})

describe('deactivation reason', () => {
  it('shows the reason and the date in the inactive list', async () => {
    withClient(<ProfileAccessTable onEditUser={jest.fn()} />)
    await screen.findByText('Bia Inativa')
    expect(
      screen.getByText(/Afastamento temporário \(férias, licença\)/),
    ).toBeInTheDocument()
    expect(screen.getByText(/20\/11\/2026/)).toBeInTheDocument()
  })

  it('shows the note and who deactivated to a coordinator', async () => {
    renderDialog()
    expect(
      await screen.findByText('Licença médica até janeiro'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Carla Coordenadora/)).toBeInTheDocument()
    expect(mockedGetActivation).toHaveBeenCalledWith('u1')
  })

  it('says the system deactivated an automatic block', async () => {
    mockedGetActivation.mockResolvedValue({
      ...activation,
      deactivated_by_id: null,
      deactivated_by_name: null,
      deactivation_reason: 'BLOQUEIO_AUTOMATICO_RATE_LIMIT',
      deactivation_note: null,
    })
    renderDialog({
      ...inactive,
      deactivation_reason: 'BLOQUEIO_AUTOMATICO_RATE_LIMIT',
    })
    expect(await screen.findByText(/pelo sistema/)).toBeInTheDocument()
  })

  it('does not fetch the note for who cannot reactivate', async () => {
    mockedOwnRole.mockReturnValue({ data: 'Administrativo' })
    renderDialog()
    await waitFor(() => expect(screen.getByText(/Bia Inativa/)).toBeTruthy())
    expect(mockedGetActivation).not.toHaveBeenCalled()
    expect(screen.queryByText('Licença médica até janeiro')).toBeNull()
  })

  it('does not fetch the note of an active user', () => {
    renderDialog({
      ...inactive,
      is_active: true,
      deactivated_at: null,
      deactivation_reason: null,
    })
    expect(mockedGetActivation).not.toHaveBeenCalled()
  })
})
