import { postTicketComment } from '@/http/tickets/ticket-comentarios'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    post: jest.fn(),
  },
}))

describe('postTicketComment', () => {
  beforeEach(() => jest.clearAllMocks())

  it('envia o parecer e todas as imagens como multipart', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({ data: true })
    const first = new File(['first'], 'first.png', { type: 'image/png' })
    const second = new File(['second'], 'second.webp', { type: 'image/webp' })
    const body = '<img src="__COMMENT_IMG_0__"><img src="__COMMENT_IMG_1__">'

    await postTicketComment('ticket/1', { body }, [first, second])

    const [path, form, options] = (api.post as jest.Mock).mock.calls[0]
    expect(path).toBe('/tickets/ticket%2F1/comments')
    expect(form).toBeInstanceOf(FormData)
    expect(form.get('payload')).toBe(JSON.stringify({ body }))
    expect(form.getAll('files')).toEqual([first, second])
    expect(options).toEqual({
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  })
})
