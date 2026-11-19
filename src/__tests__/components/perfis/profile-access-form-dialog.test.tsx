import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'

import { ProfileAccessFormDialog } from '@/app/(app)/demandas/perfis/components/profile-access-form-dialog'
import { useOwnUserRole } from '@/hooks/useQueries/useOwnUserRole'
import { useProfile } from '@/hooks/useQueries/useProfile'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

// Staging: o perfil Desenvolvedor existe.
jest.mock('@/config', () => {
  const actual = jest.requireActual('@/config')
  return { ...actual, config: { ...actual.config, enableDeveloperRole: true } }
})
jest.mock('@/hooks/useQueries/useOwnUserRole', () => ({
  useOwnUserRole: jest.fn(),
}))
jest.mock('@/hooks/useQueries/useProfile', () => ({ useProfile: jest.fn() }))
jest.mock('@/http/user-roles/update-user-roles', () => ({
  updateUserRoles: jest.fn(),
}))

const mockedOwnRole = useOwnUserRole as jest.Mock
const mockedProfile = useProfile as jest.Mock

const active: UserRoleListItem = {
  id: 'u1',
  username: 'ana',
  full_name: 'Ana Ativa',
  email: null,
  role: 'Agente',
  is_active: true,
}
const inactive: UserRoleListItem = { ...active, is_active: false }

function renderDialog(
  user: UserRoleListItem,
  onRequestActivationChange = jest.fn(),
) {
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
        onRequestActivationChange={onRequestActivationChange}
      />
    </QueryClientProvider>,
  )
  return { onRequestActivationChange }
}

describe('ProfileAccessFormDialog activation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedProfile.mockReturnValue({ data: { id: 'me', username: 'me' } })
    mockedOwnRole.mockReturnValue({ data: 'Coordenador' })
  })

  it('lets a coordinator start the deactivation of an active user', () => {
    const { onRequestActivationChange } = renderDialog(active)

    fireEvent.click(screen.getByRole('button', { name: 'Desativar usuário' }))

    expect(onRequestActivationChange).toHaveBeenCalledWith(active)
    expect(
      screen.queryByRole('button', { name: 'Reativar usuário' }),
    ).toBeNull()
  })

  it('treats Desenvolvedor as coordinator', () => {
    mockedOwnRole.mockReturnValue({ data: 'Desenvolvedor' })
    renderDialog(active)
    expect(
      screen.getByRole('button', { name: 'Desativar usuário' }),
    ).toBeInTheDocument()
  })

  it.each(['Agente', 'Adjunto', undefined])(
    'hides the activation action for %s',
    (role) => {
      mockedOwnRole.mockReturnValue({ data: role })
      renderDialog(active)
      expect(screen.queryByRole('button', { name: /usuário$/ })).toBeNull()
    },
  )

  it('never offers to deactivate yourself', () => {
    renderDialog({ ...active, id: 'me' })
    expect(
      screen.queryByRole('button', { name: 'Desativar usuário' }),
    ).toBeNull()
  })

  it('locks the role of an inactive user and offers reactivation', () => {
    const { onRequestActivationChange } = renderDialog(inactive)

    expect(
      screen.getByText('Usuário inativo. Reative para alterar o perfil.'),
    ).toBeInTheDocument()
    for (const checkbox of screen.getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled()
    }
    // a seção inteira aparece desabilitada, não só as caixinhas
    expect(
      screen.getByRole('group', { name: 'Perfil de acesso' }),
    ).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Reativar usuário' }))
    expect(onRequestActivationChange).toHaveBeenCalledWith(inactive)
  })

  it('hides the deactivation of a Desenvolvedor from a coordinator', () => {
    renderDialog({ ...active, role: 'Desenvolvedor' })
    expect(
      screen.queryByRole('button', { name: 'Desativar usuário' }),
    ).toBeNull()
  })

  it('lets a Desenvolvedor deactivate another Desenvolvedor', () => {
    mockedOwnRole.mockReturnValue({ data: 'Desenvolvedor' })
    renderDialog({ ...active, role: 'Desenvolvedor' })
    expect(
      screen.getByRole('button', { name: 'Desativar usuário' }),
    ).toBeInTheDocument()
  })

  it('still lets a coordinator reactivate a Desenvolvedor', () => {
    renderDialog({ ...inactive, role: 'Desenvolvedor' })
    expect(
      screen.getByRole('button', { name: 'Reativar usuário' }),
    ).toBeInTheDocument()
  })
})
