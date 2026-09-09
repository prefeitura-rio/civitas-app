import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  emptyArchiveFilters,
  TicketArchiveFiltersModal,
} from '@/app/(app)/demandas/arquivados/components/ticket-archive-filters'
import { getTeamsList } from '@/http/teams/get-teams'
import { searchTicketArchiveParticipants } from '@/http/tickets/tickets-dashboard-filters'

jest.mock('@/http/teams/get-teams', () => ({ getTeamsList: jest.fn() }))
jest.mock('@/http/tickets/tickets-dashboard-filters', () => ({
  searchOperations: jest.fn(),
  searchRequesters: jest.fn(),
  searchTicketResponsibles: jest.fn(),
  searchTicketArchiveParticipants: jest.fn(),
}))

const mockedGetTeamsList = getTeamsList as jest.Mock
const mockedSearchParticipants = searchTicketArchiveParticipants as jest.Mock

function renderModal(onApply = jest.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <TicketArchiveFiltersModal
        isOpen
        filters={emptyArchiveFilters()}
        onApply={onApply}
        onClose={jest.fn()}
      />
    </QueryClientProvider>,
  )

  return { onApply, ...view }
}

describe('TicketArchiveFiltersModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetTeamsList.mockResolvedValue({ data: [] })
    mockedSearchParticipants.mockResolvedValue([
      { value: 'user-1', label: '[QA] Adjunto' },
    ])
  })

  it('adds a historical participant and applies its id as a filter', async () => {
    const { onApply } = renderModal()
    const participantLabel = screen.getByText('PARTICIPANTE')
    const participantInput =
      participantLabel.parentElement?.querySelector('input')

    expect(participantInput).not.toBeNull()
    fireEvent.focus(participantInput!)
    fireEvent.change(participantInput!, { target: { value: 'Adjunto' } })

    await waitFor(() => {
      expect(mockedSearchParticipants).toHaveBeenCalledWith('Adjunto')
    })

    fireEvent.click(await screen.findByRole('button', { name: '[QA] Adjunto' }))
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        participant_id: [{ value: 'user-1', label: '[QA] Adjunto' }],
      }),
    )
  })
})
