import {
  resendTicketResponseLinks,
  type ResendTicketResponseLinksOut,
} from '@/http/tickets/resend-ticket-response-links'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}))

describe('resendTicketResponseLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('requests the resend endpoint for the ticket and returns its result', async () => {
    const response: ResendTicketResponseLinksOut = {
      success: true,
      recipients: ['requester@example.test'],
      link_count: 2,
    }
    ;(api.post as jest.Mock).mockResolvedValue({ data: response })

    await expect(resendTicketResponseLinks('ticket/id')).resolves.toEqual(
      response,
    )

    expect(api.post).toHaveBeenCalledWith(
      '/workflow/ticket%2Fid/resend-response-links',
    )
  })
})
