import { gcsResumableChunkedUpload } from '@/http/tickets/ticket-gcs-resumable'

const SESSION_URI = 'https://storage.example.test/upload?upload_id=abc'

function response(status: number, range?: string) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) => (name === 'Range' ? (range ?? null) : null),
    },
    text: async () => '',
  }
}

function contentRanges(fetchMock: jest.Mock): string[] {
  return fetchMock.mock.calls.map(
    ([, init]) => (init.headers as Record<string, string>)['Content-Range'],
  )
}

describe('gcsResumableChunkedUpload', () => {
  const file = new File([new Uint8Array(10)], 'relatorio.pdf', {
    type: 'application/pdf',
  })
  let fetchMock: jest.Mock

  beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it.failing('não consulta o offset de uma sessão recém-criada', async () => {
    // Sessão nova não tem bytes recebidos; a consulta (PUT vazio) só serve para retomar.
    fetchMock.mockResolvedValue(response(200))

    await gcsResumableChunkedUpload(SESSION_URI, file, 'application/pdf', {
      isNewSession: true,
    })

    expect(contentRanges(fetchMock)).toEqual(['bytes 0-9/10'])
  })

  it('consulta o offset ao retomar uma sessão existente', async () => {
    fetchMock
      .mockResolvedValueOnce(response(308, 'bytes=0-3'))
      .mockResolvedValueOnce(response(200))

    await gcsResumableChunkedUpload(SESSION_URI, file, 'application/pdf')

    expect(contentRanges(fetchMock)).toEqual(['bytes */10', 'bytes 4-9/10'])
  })
})
