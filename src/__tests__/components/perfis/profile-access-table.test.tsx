import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import { ProfileAccessTable } from '@/app/(app)/demandas/perfis/components/profile-access-table'
import { getUsersWithRoles } from '@/http/user-roles/get-users-with-roles'

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

const users = [
  {
    id: 'u1',
    username: 'ana',
    full_name: 'Ana Ativa',
    email: null,
    role: 'Agente',
    is_active: true,
  },
  {
    id: 'u2',
    username: 'bia',
    full_name: 'Bia Inativa',
    email: null,
    role: 'Agente',
    is_active: false,
  },
]

function renderTable(onEditUser = jest.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrap = (ui: ReactNode) => (
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  )
  const view = render(wrap(<ProfileAccessTable onEditUser={onEditUser} />))
  const rerender = () =>
    view.rerender(wrap(<ProfileAccessTable onEditUser={onEditUser} />))
  return { onEditUser, rerender }
}

describe('ProfileAccessTable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    currentSearch = ''
    mockedGetUsers.mockResolvedValue({ data: { items: users, total: 2 } })
  })

  it('requests active users by default', async () => {
    renderTable()
    await screen.findByText('Ana Ativa')
    expect(mockedGetUsers).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active', page: 1 }),
    )
    expect(
      screen.getByRole('combobox', { name: 'Situação' }),
    ).toHaveTextContent('Ativos')
  })

  it('reads the status from the URL', async () => {
    currentSearch = 'status=all'
    renderTable()
    await screen.findByText('Ana Ativa')
    expect(
      screen.getByRole('combobox', { name: 'Situação' }),
    ).toHaveTextContent('Todos')
    expect(mockedGetUsers).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'all' }),
    )
  })

  it('flags inactive users and keeps a single Editar action per row', async () => {
    currentSearch = 'status=all'
    const { onEditUser } = renderTable()
    await screen.findByText('Bia Inativa')

    expect(screen.getAllByText('Inativo')).toHaveLength(1)
    const editButtons = screen.getAllByRole('button', { name: 'Editar' })
    expect(editButtons).toHaveLength(2)
    fireEvent.click(editButtons[1])
    expect(onEditUser).toHaveBeenCalledWith(users[1])
    // Desativar/Reativar ficam dentro do diálogo de edição.
    expect(
      screen.queryByRole('button', { name: /^(Desativar|Reativar)/ }),
    ).toBeNull()
  })

  it('keeps the current rows while the next page loads', async () => {
    const { rerender } = renderTable()
    await screen.findByText('Ana Ativa')

    mockedGetUsers.mockReturnValue(new Promise(() => {}))
    currentSearch = 'page=2&size=10'
    rerender()

    expect(screen.queryByText('Carregando...')).toBeNull()
    expect(screen.getByText('Ana Ativa')).toBeInTheDocument()
    expect(mockedGetUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
    )
  })
})
