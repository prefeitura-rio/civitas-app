import { putTicketResposta } from '@/http/tickets/ticket-resposta'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    put: jest.fn(),
  },
}))

describe('putTicketResposta', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sends the HTML and new inline images as multipart form data', async () => {
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
    const image = new File(['image-bytes'], 'foto.png', { type: 'image/png' })

    await putTicketResposta(
      'ticket/1',
      {
        html_content: '<img src="__RESPONSE_IMG_0__">',
        service_attachment_ids: ['attachment-1'],
      },
      [image],
    )

    const [path, form, options] = (api.put as jest.Mock).mock.calls[0]
    expect(path).toBe('/tickets/ticket%2F1/response-report')
    expect(form).toBeInstanceOf(FormData)
    expect(form.get('payload')).toBe(
      JSON.stringify({
        html_content: '<img src="__RESPONSE_IMG_0__">',
        service_attachment_ids: ['attachment-1'],
      }),
    )
    expect(form.getAll('files')).toEqual([image])
    expect(options).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })
})
