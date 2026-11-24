import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { UserActivationDialog } from '@/app/(app)/demandas/perfis/components/user-activation-dialog'
import { getDeactivationPreview } from '@/http/user-roles/get-deactivation-preview'

jest.mock('@/http/user-roles/deactivate-user', () => ({
  deactivateUser: jest.fn(),
}))
jest.mock('@/http/user-roles/reactivate-user', () => ({
  reactivateUser: jest.fn(),
}))
jest.mock('@/http/user-roles/get-deactivation-preview', () => ({
  getDeactivationPreview: jest.fn(),
}))
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockedPreview = getDeactivationPreview as jest.Mock

const user = {
  id: 'u1',
  username: 'ana',
  full_name: 'Ana',
  email: null,
  role: 'Adjunto' as const,
  is_active: true,
}

const emptyPreview = {
  sole_open_tickets: 0,
  shared_open_tickets: 0,
  teams: [],
  transfer_candidates: [],
  teams_left_without_adjunto: [],
}

function renderDialog() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <UserActivationDialog user={user} onClose={jest.fn()} />
    </QueryClientProvider>,
  )
}

describe('UserActivationDialog warnings', () => {
  beforeEach(() => jest.clearAllMocks())

  it('explains and blocks when nobody can take the sole tickets', async () => {
    mockedPreview.mockResolvedValue({ ...emptyPreview, sole_open_tickets: 2 })
    renderDialog()

    expect(
      await screen.findByText(
        'Nenhum usuário pode assumir estes chamados. Verifique a configuração do workflow.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.getByRole('button', { name: 'Desativar' })).toBeDisabled()
  })

  it('warns when a team is left without an active adjunto', async () => {
    mockedPreview.mockResolvedValue({
      ...emptyPreview,
      teams: ['Equipe A'],
      teams_left_without_adjunto: ['Equipe A'],
    })
    renderDialog()

    expect(
      await screen.findByText(
        'A equipe Equipe A ficará sem adjunto ativo: novos chamados para ela serão recusados até outro adjunto ser cadastrado.',
      ),
    ).toBeInTheDocument()
    // O aviso não bloqueia a desativação.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Desativar' })).toBeEnabled(),
    )
  })
})
