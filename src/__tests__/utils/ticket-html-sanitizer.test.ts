import {
  getTicketReportClipboardImages,
  getTicketReportImageValidationError,
  removeTicketReportImageLoaderState,
  sanitizeTicketHtml,
  TICKET_REPORT_IMAGE_MAX_BYTES,
  TICKET_REPORT_IMAGE_MAX_SIZE_ERROR,
} from '@/app/(app)/demandas/[ticketId]/components/ticket-detail-rich-text'

describe('sanitizeTicketHtml', () => {
  it('removes executable URL schemes, including encoded schemes', () => {
    const sanitized = sanitizeTicketHtml(
      '<a href=javascript:alert(1)>um</a>' +
        '<a href="&#x6a;avascript:alert(2)">dois</a>' +
        '<a href="data:text/html,<script>alert(3)</script>">três</a>',
    )

    expect(sanitized).not.toContain('javascript:')
    expect(sanitized).not.toContain('data:text/html')
    expect(sanitized).toContain('<a>um</a>')
    expect(sanitized).toContain('<a>dois</a>')
  })

  it('keeps safe links and protects links opened in a new tab', () => {
    const sanitized = sanitizeTicketHtml(
      '<a href="https://civitas.rio" target="_blank">Civitas</a>',
    )

    expect(sanitized).toContain('href="https://civitas.rio"')
    expect(sanitized).toContain('rel="noopener noreferrer"')
  })
})

describe('getTicketReportClipboardImages', () => {
  it('retorna todas as imagens suportadas na ordem do clipboard', () => {
    const first = new File(['first'], 'first.png', { type: 'image/png' })
    const second = new File(['second'], 'second.webp', { type: 'image/webp' })
    const text = new File(['text'], 'note.txt', { type: 'text/plain' })
    const items = [
      { type: first.type, getAsFile: () => first },
      { type: text.type, getAsFile: () => text },
      { type: second.type, getAsFile: () => second },
      { type: 'image/jpeg', getAsFile: () => null },
    ]

    expect(getTicketReportClipboardImages(items)).toEqual([first, second])
  })
})

describe('getTicketReportImageValidationError', () => {
  it('aceita uma imagem exatamente no limite de 10 MB', () => {
    const file = new File([], 'imagem.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', {
      value: TICKET_REPORT_IMAGE_MAX_BYTES,
    })

    expect(getTicketReportImageValidationError(file)).toBeNull()
  })

  it('retorna o aviso padrão acima de 10 MB', () => {
    const file = new File([], 'imagem.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', {
      value: TICKET_REPORT_IMAGE_MAX_BYTES + 1,
    })

    expect(getTicketReportImageValidationError(file)).toBe(
      TICKET_REPORT_IMAGE_MAX_SIZE_ERROR,
    )
  })
})

describe('removeTicketReportImageLoaderState', () => {
  it('não persiste estado visual de carregamento no HTML', () => {
    const root = document.createElement('div')
    root.innerHTML =
      '<img class="outra-classe ticketReportImageLoading" aria-busy="true">'

    removeTicketReportImageLoaderState(root)

    expect(root.innerHTML).not.toContain('aria-busy')
    expect(root.innerHTML).not.toContain('ticketReportImageLoading')
    expect(root.innerHTML).toContain('outra-classe')
  })
})
