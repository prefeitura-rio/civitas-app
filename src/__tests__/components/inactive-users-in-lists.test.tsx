import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { TeamsList } from '@/app/(app)/demandas/equipes/components/teams-list'
import {
  adjunctOptionFromUser,
  emptyShiftClosingsFilters,
  ShiftClosingsFilters,
} from '@/app/(app)/demandas/fechamentos/components/shift-closings-filters'
import { getTeams, getTeamsList } from '@/http/teams/get-teams'
import { getUsersOnlyWithRoles } from '@/http/user-roles/get-users-only-with-roles'

jest.mock('@/http/teams/get-teams', () => ({
  getTeams: jest.fn(),
  getTeamsList: jest.fn(),
}))
jest.mock('@/http/user-roles/get-users-only-with-roles', () => ({
  getUsersOnlyWithRoles: jest.fn(),
}))

function withClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('inactive users in lists', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows a message for a team without members', async () => {
    ;(getTeams as jest.Mock).mockResolvedValue({
      data: {
        items: [
          {
            id: 't1',
            created_at: '2026-01-01',
            name: 'Equipe vazia',
            description: null,
            is_active: true,
            members: [],
          },
        ],
        total: 1,
      },
    })
    const controller = {
      openCreateMemberDialog: jest.fn(),
      openEditMemberDialog: jest.fn(),
      openEditTeamDialog: jest.fn(),
      openDeleteTeamDialog: jest.fn(),
      openDeleteTeamMemberDialog: jest.fn(),
    }

    withClient(<TeamsList controller={controller as never} />)

    expect(
      await screen.findByText('Nenhum colaborador nesta equipe.'),
    ).toBeInTheDocument()
  })

  it('shift closings list every adjunct, marking the inactive ones', async () => {
    ;(getUsersOnlyWithRoles as jest.Mock).mockResolvedValue({ data: [] })
    ;(getTeamsList as jest.Mock).mockResolvedValue({ data: [] })

    withClient(
      <ShiftClosingsFilters
        filters={emptyShiftClosingsFilters()}
        onChange={jest.fn()}
      />,
    )

    await waitFor(() =>
      expect(getUsersOnlyWithRoles).toHaveBeenCalledWith({
        role: 'Adjunto',
        status: 'all',
      }),
    )
  })

  it('labels adjunct options', () => {
    const base = {
      id: 'u1',
      username: 'ana',
      full_name: ' Ana ',
      email: null,
      role: 'Adjunto' as const,
    }
    expect(adjunctOptionFromUser({ ...base, is_active: true })).toEqual({
      value: 'u1',
      label: 'Ana',
    })
    expect(
      adjunctOptionFromUser({ ...base, full_name: null, is_active: false }),
    ).toEqual({
      value: 'u1',
      label: 'ana (inativo)',
    })
  })
})
