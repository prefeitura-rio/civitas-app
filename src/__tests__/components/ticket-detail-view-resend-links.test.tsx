import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { toast } from 'sonner'

import { TicketDetailView } from '@/app/(app)/demandas/[ticketId]/components/ticket-detail-view'
import { getTicketAllowedActions } from '@/http/tickets/get-ticket-allowed-actions'
import { getTicketCabecalho } from '@/http/tickets/get-ticket-cabecalho'
import { getTicketNotificationEmails } from '@/http/tickets/get-ticket-notification-emails'
import { resendTicketResponseLinks } from '@/http/tickets/resend-ticket-response-links'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}))

jest.mock('next/link', () => ({ children, ...props }: any) => (
  <a {...props}>{children}</a>
))

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

jest.mock('@/http/tickets/get-ticket-cabecalho', () => ({
  getTicketCabecalho: jest.fn(),
}))

jest.mock('@/http/tickets/get-ticket-allowed-actions', () => ({
  getTicketAllowedActions: jest.fn(),
}))

jest.mock('@/http/tickets/get-ticket-notification-emails', () => ({
  getTicketNotificationEmails: jest.fn(),
}))

jest.mock('@/http/tickets/resend-ticket-response-links', () => ({
  resendTicketResponseLinks: jest.fn(),
}))

jest.mock(
  '@/app/(app)/demandas/[ticketId]/hooks/use-ticket-unsaved-guard',
  () => ({
    releaseTicketUnsavedBackTrap: jest.fn(),
    useTicketUnsavedGuard: jest.fn(),
  }),
)

jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-solicitante',
  () => ({ TicketDetailTabSolicitante: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-chamado',
  () => ({ TicketDetailTabChamado: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-documentos',
  () => ({ TicketDetailTabDocumentos: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-servicos',
  () => ({ TicketDetailTabServicos: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-parecer-interno',
  () => ({ TicketDetailTabParecerInterno: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-relatorio-demanda',
  () => ({ TicketDetailTabRelatorioDemanda: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-historico',
  () => ({ TicketDetailTabHistorico: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-resposta',
  () => ({ TicketDetailTabResposta: () => null }),
)
jest.mock(
  '@/app/(app)/demandas/[ticketId]/components/ticket-detail-unsaved-dialog',
  () => ({ TicketDetailUnsavedDialog: () => null }),
)

const mockedGetTicketCabecalho = getTicketCabecalho as jest.Mock
const mockedGetTicketAllowedActions = getTicketAllowedActions as jest.Mock
const mockedGetTicketNotificationEmails =
  getTicketNotificationEmails as jest.Mock
const mockedResendTicketResponseLinks = resendTicketResponseLinks as jest.Mock

function renderView() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TicketDetailView ticketId="ticket-1" />
    </QueryClientProvider>,
  )
}

describe('TicketDetailView - reenviar links', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetTicketCabecalho.mockResolvedValue({
      internal_number: '0005550',
      status: 'FINALIZADO',
      ticket_type_name: 'Convencional',
      priority: null,
      base_date: null,
      team: 'Coordenadores',
      created_at: new Date().toISOString(),
      assignee: 'Ricardo',
      open_duration: '0 dias',
    })
    mockedGetTicketAllowedActions.mockResolvedValue({
      ticket_id: 'ticket-1',
      state_id: 'FINALIZADO',
      can_view: true,
      allowed_action_ids: ['REABRIR_DEMANDA'],
    })
    mockedGetTicketNotificationEmails.mockResolvedValue([
      'requester@example.test',
    ])
    mockedResendTicketResponseLinks.mockResolvedValue({
      success: true,
      recipients: ['requester@example.test'],
      link_count: 1,
    })
  })

  it('opens confirmation and resends response links without reopening the ticket', async () => {
    renderView()

    fireEvent.click(
      await screen.findByRole('button', { name: 'Reenviar Links' }),
    )

    expect(
      await screen.findByText(
        'O e-mail de resposta será reenviado com links atualizados para:',
      ),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('requester@example.test'),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reenviar Links' }))

    await waitFor(() => {
      expect(mockedResendTicketResponseLinks).toHaveBeenCalledWith('ticket-1')
    })
  })

  it('blocks resending links after 180 days and shows the expiration warning', async () => {
    mockedGetTicketCabecalho.mockResolvedValueOnce({
      internal_number: '0005550',
      status: 'FINALIZADO',
      ticket_type_name: 'Convencional',
      priority: null,
      base_date: null,
      team: 'Coordenadores',
      created_at: '2020-01-01T12:00:00Z',
      assignee: 'Ricardo',
      open_duration: '0 dias',
    })
    renderView()

    const resendButton = await screen.findByRole('button', {
      name: 'Reenviar Links',
    })
    expect(resendButton).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(resendButton)

    expect(toast.error).toHaveBeenCalledWith(
      'O reenvio de links só é permitido até 180 dias após a abertura da demanda.',
    )
    expect(
      screen.queryByText(
        'O e-mail de resposta será reenviado com links atualizados para:',
      ),
    ).not.toBeInTheDocument()
    expect(mockedResendTicketResponseLinks).not.toHaveBeenCalled()
  })
})
