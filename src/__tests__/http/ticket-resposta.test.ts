import { putTicketResposta } from '@/http/tickets/ticket-resposta'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    put: jest.fn(),
  },
}))

describe('putTicketResposta', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sends the response report as JSON', async () => {
    ;(api.put as jest.Mock).mockResolvedValue({
      data: {
        id: 'report-1',
        ticket_id: 'ticket-1',
        html_content: '<p>Resposta</p>',
        created_at: null,
        updated_at: null,
        updated_by_id: null,
        updated_by_name: null,
        service_attachments: [],
      },
    })
    await putTicketResposta('ticket/1', {
      html_content: '<p>Resposta</p>',
      service_attachment_ids: ['attachment-1'],
    })

    const [path, payload] = (api.put as jest.Mock).mock.calls[0]
    expect(path).toBe('/tickets/ticket%2F1/response-report')
    expect(payload).toEqual({
      html_content: '<p>Resposta</p>',
      service_attachment_ids: ['attachment-1'],
    })
  })
})
