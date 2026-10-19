import '@testing-library/jest-dom'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TicketArchiveList } from '@/app/(app)/demandas/arquivados/components/ticket-archive-list'
import { TicketsGeneralList } from '@/app/(app)/demandas/list/tickets-general-list'
import { getTeamsList } from '@/http/teams/get-teams'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({ api: { get: jest.fn(), post: jest.fn() } }))
jest.mock('@/http/teams/get-teams', () => ({ getTeamsList: jest.fn() }))

const mockedGetTeamsList = getTeamsList as jest.Mock

const tickets = [
  {
    id: 'with-press-alias',
    ticket: '0000101',
    internal_number: 101,
    status: 'PENDENTE',
    requester_operation: 'Demandante de teste',
    assignee: '',
    team: '',
    priority: 'ROTINA',
    overdue_days: 0,
    services: [],
  },
  {
    id: 'without-press-alias',
    ticket: '0000102',
    internal_number: 102,
    status: 'PENDENTE',
    requester_operation: 'Demandante de teste',
    assignee: '',
    team: '',
    priority: 'ROTINA',
    overdue_days: 0,
    services: [],
  },
]

describe.each([
  ['lista de chamados', TicketsGeneralList, 'Salvar', '/tickets/dashboard'],
  ['arquivados', TicketArchiveList, 'Aplicar', '/tickets/archive'],
] as const)('filtro de imprensa em %s', (_name, List, applyLabel, endpoint) => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    mockedGetTeamsList.mockResolvedValue({ data: [] })
    jest.mocked(api.post).mockImplementation(async (url, body) => {
      const filters = body as { has_press_alias?: boolean }
      const items = filters.has_press_alias ? tickets.slice(0, 1) : tickets
      const section = { total: items.length, items }
      return {
        data:
          url === '/tickets/archive'
            ? { ...section, page: 1, page_size: 20, pages: 1 }
            : {
                pending: section,
                restricted: null,
                awaiting_adjunct_review: null,
                awaiting_administrative_review: null,
                blocked: null,
                urgent: null,
                overdue: null,
                total: items.length,
                open: items.length,
              },
      }
    })
  })

  it('envia o filtro ao aplicar e restaura todos os chamados ao desligar ou limpar', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })
    render(
      <QueryClientProvider client={client}>
        <List />
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('link', { name: '0000102' })).toBeVisible()

    async function applySwitch() {
      fireEvent.click(screen.getByRole('button', { name: /^Filtrar/ }))
      const callsBeforeToggle = jest.mocked(api.post).mock.calls.length
      fireEvent.click(screen.getByRole('switch'))
      expect(api.post).toHaveBeenCalledTimes(callsBeforeToggle)
      fireEvent.click(screen.getByRole('button', { name: applyLabel }))
    }

    await applySwitch()
    await waitFor(() => {
      expect(api.post).toHaveBeenLastCalledWith(
        endpoint,
        expect.objectContaining({ has_press_alias: true }),
      )
      expect(screen.getByRole('link', { name: '0000101' })).toBeVisible()
      expect(screen.queryByRole('link', { name: '0000102' })).toBeNull()
    })
    expect(screen.getByRole('button', { name: 'Filtrar (1)' })).toBeVisible()

    await applySwitch()
    expect(await screen.findByRole('link', { name: '0000102' })).toBeVisible()
    expect(api.post).toHaveBeenLastCalledWith(
      endpoint,
      expect.objectContaining({ has_press_alias: undefined }),
    )

    await applySwitch()
    await waitFor(() => {
      expect(screen.getByRole('link', { name: '0000101' })).toBeVisible()
      expect(screen.queryByRole('link', { name: '0000102' })).toBeNull()
    })
    fireEvent.click(screen.getByRole('button', { name: /Limpar filtro/i }))
    expect(await screen.findByRole('link', { name: '0000102' })).toBeVisible()
    expect(api.post).toHaveBeenLastCalledWith(
      endpoint,
      expect.objectContaining({ has_press_alias: undefined }),
    )
    expect(screen.getByRole('button', { name: 'Filtrar' })).toBeVisible()
  })
})
