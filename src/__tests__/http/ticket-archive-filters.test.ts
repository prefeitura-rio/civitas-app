import { getTicketArchive } from '@/http/tickets/get-ticket-archive'
import { searchTicketArchiveParticipants } from '@/http/tickets/tickets-dashboard-filters'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}))

describe('archive ticket filters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('searches historical archive participants', async () => {
    ;(api.get as jest.Mock).mockResolvedValue({
      data: [{ user_id: 'user-1', user_name: '[QA] Adjunto' }],
    })

    await expect(searchTicketArchiveParticipants('Adjunto')).resolves.toEqual([
      { value: 'user-1', label: '[QA] Adjunto' },
    ])

    expect(api.get).toHaveBeenCalledWith(
      '/tickets/archive-participants/search',
      { params: { search: 'Adjunto' } },
    )
  })

  it('sends selected historical participants with the archive filters', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: { items: [] } })

    await getTicketArchive({
      participant_id: ['user-1'],
      team: ['team-1'],
      page: 2,
      page_size: 50,
    })

    expect(api.post).toHaveBeenCalledWith('/tickets/archive', {
      search: undefined,
      participant_id: ['user-1'],
      page: 2,
      page_size: 50,
      operation_id: undefined,
      requester: undefined,
      assignee_id: undefined,
      base_date_start: undefined,
      base_date_end: undefined,
      entry_date_start: undefined,
      entry_date_end: undefined,
      priority: undefined,
      team: ['team-1'],
      services: undefined,
    })
  })
})
