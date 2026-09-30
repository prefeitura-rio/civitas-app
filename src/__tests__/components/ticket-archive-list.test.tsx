import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { toast } from 'sonner'

import { TicketArchiveList } from '@/app/(app)/demandas/arquivados/components/ticket-archive-list'
import { getTicketArchive } from '@/http/tickets/get-ticket-archive'

jest.mock('next/link', () => ({ children, ...props }: any) => (
  <a {...props}>{children}</a>
))

jest.mock('sonner', () => ({
  toast: { message: jest.fn() },
}))

jest.mock(
  '@/app/(app)/demandas/arquivados/components/ticket-archive-filters',
  () => ({
    ArchiveSearchField: () => <input aria-label="Buscar chamados" />,
    emptyArchiveFilters: () => ({
      operation_id: [],
      requester: [],
      assignee_id: [],
      participant_id: [],
      base_date_start: '',
      base_date_end: '',
      entry_date_start: '',
      entry_date_end: '',
      priority: [],
      team: [],
      services: [],
    }),
    TicketArchiveFiltersModal: () => null,
  }),
)

jest.mock('@/http/tickets/get-ticket-archive', () => ({
  getTicketArchive: jest.fn(),
}))

const mockedGetTicketArchive = getTicketArchive as jest.Mock
const mockedToastMessage = toast.message as jest.Mock

function renderList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TicketArchiveList />
    </QueryClientProvider>,
  )
}

describe('TicketArchiveList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    mockedGetTicketArchive.mockResolvedValue({
      total: 1,
      page: 1,
      page_size: 20,
      pages: 1,
      items: [
        {
          id: 'ticket-5553',
          ticket: '0005553',
          completed_at: '18/08/2026',
          requester_operation: 'Ricardo',
          team: 'Administrativo',
          teams: [
            { name: 'Coordenadores', people: ['Ricardo Silva'] },
            { name: 'Administrativo', people: ['[QA] Administrativo'] },
            { name: 'TESTE', people: ['[QA] Adjunto'] },
            { name: 'FOX', people: ['[QA] FOX Arquivados'] },
          ],
          assignee: '[QA] Administrativo',
          services: ['Busca por placa'],
          status: 'FINALIZADO',
        },
      ],
    })
  })

  it('shows two historical teams and summarizes the remaining ones', async () => {
    renderList()

    expect(await screen.findByText('Coordenadores')).toBeInTheDocument()
    expect(screen.getByText('Administrativo')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('restores archived-list filters without adding them to the URL', async () => {
    window.sessionStorage.setItem(
      'ticket-archive-list-state',
      JSON.stringify({
        filters: {
          priority: [{ value: 'URGENTE', label: 'Urgente' }],
        },
        search: 'placa ABC1234',
        page: 1,
      }),
    )

    renderList()

    await screen.findByText('Coordenadores')
    expect(mockedGetTicketArchive).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: ['URGENTE'],
        search: 'placa ABC1234',
      }),
    )

    const ticketLink = screen.getByRole('link', { name: '0005553' })
    const ticketUrl = new URL(
      ticketLink.getAttribute('href')!,
      'http://localhost',
    )
    expect(ticketUrl.pathname).toBe('/demandas/ticket-5553')
    expect(ticketUrl.search).toBe('')
    expect(mockedToastMessage).toHaveBeenCalledWith(
      'Filtros ativos foram restaurados.',
    )
  })
})
