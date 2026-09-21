import { sanitizeTicketHtml } from '@/app/(app)/demandas/[ticketId]/components/ticket-detail-rich-text'

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
