import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { ProfileAccessFormDialog } from '@/app/(app)/demandas/perfis/components/profile-access-form-dialog'
import { useOwnUserRole } from '@/hooks/useQueries/useOwnUserRole'
import { useProfile } from '@/hooks/useQueries/useProfile'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

jest.mock('@/hooks/useQueries/useOwnUserRole', () => ({
  useOwnUserRole: jest.fn(),
}))
jest.mock('@/hooks/useQueries/useProfile', () => ({ useProfile: jest.fn() }))
jest.mock('@/http/user-roles/update-user-roles', () => ({
  updateUserRoles: jest.fn(),
}))

const mockedOwnRole = useOwnUserRole as jest.Mock
const mockedProfile = useProfile as jest.Mock

const base: UserRoleListItem = {
  id: 'u1',
  username: 'alvo',
  full_name: 'Alvo',
  email: null,
  role: 'Agente',
  is_active: true,
}
const developer: UserRoleListItem = { ...base, role: 'Desenvolvedor' }
const serviceAccount: UserRoleListItem = {
  ...base,
  username: 'integracao',
  is_service_account: true,
}

function renderDialog(user: UserRoleListItem) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ProfileAccessFormDialog
        isOpen
        onOpen={jest.fn()}
        onClose={jest.fn()}
        dialogInitialData={user}
        setDialogInitialData={jest.fn()}
        onRequestActivationChange={jest.fn()}
      />
    </QueryClientProvider>,
  )
}

function expectLocked() {
  for (const checkbox of screen.getAllByRole('checkbox')) {
    expect(checkbox).toBeDisabled()
  }
  expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: /usuário$/ })).toBeNull()
}

describe('only a Desenvolvedor changes Desenvolvedores and service accounts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedProfile.mockReturnValue({ data: { id: 'me', username: 'me' } })
    mockedOwnRole.mockReturnValue({ data: 'Coordenador' })
  })

  it('locks an active Desenvolvedor for a coordinator', () => {
    renderDialog(developer)
    expectLocked()
  })

  it('does not let a coordinator reactivate a Desenvolvedor', () => {
    renderDialog({ ...developer, is_active: false })
    expect(
      screen.queryByRole('button', { name: 'Reativar usuário' }),
    ).toBeNull()
  })

  it('locks an active service account for a coordinator', () => {
    renderDialog(serviceAccount)
    expectLocked()
    expect(
      screen.getByText(
        'Só um Desenvolvedor pode alterar uma conta de serviço.',
      ),
    ).toBeInTheDocument()
  })

  it('does not let a coordinator reactivate a service account', () => {
    renderDialog({ ...serviceAccount, is_active: false })
    expect(
      screen.queryByRole('button', { name: 'Reativar usuário' }),
    ).toBeNull()
  })

  it('lets a Desenvolvedor manage another Desenvolvedor', () => {
    mockedOwnRole.mockReturnValue({ data: 'Desenvolvedor' })
    renderDialog(developer)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Desativar usuário' }),
    ).toBeInTheDocument()
  })

  it('lets a Desenvolvedor manage a service account', () => {
    mockedOwnRole.mockReturnValue({ data: 'Desenvolvedor' })
    renderDialog(serviceAccount)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Desativar usuário' }),
    ).toBeInTheDocument()
  })
})
