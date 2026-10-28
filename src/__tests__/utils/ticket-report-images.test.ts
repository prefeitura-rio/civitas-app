import {
  toBrowserTicketReportHtml,
  toStoredTicketReportHtml,
} from '@/utils/ticket-report-images'

const ticketId = '11111111-1111-1111-1111-111111111111'
const imageId = '22222222-2222-2222-2222-222222222222'
const commentId = '33333333-3333-3333-3333-333333333333'
describe('ticket demand report image paths', () => {
  const apiPath = `/tickets/${ticketId}/demand-report/images/${imageId}`

  it('uses the authenticated BFF route in the browser', () => {
    expect(toBrowserTicketReportHtml(`<img src="${apiPath}">`)).toBe(
      `<img src="/api/bff${apiPath}">`,
    )
  })

  it('restores the canonical API route before saving', () => {
    expect(toStoredTicketReportHtml(`<img src="/api/bff${apiPath}">`)).toBe(
      `<img src="${apiPath}">`,
    )
  })

  it('does not rewrite unrelated image URLs', () => {
    const external = '<img src="https://example.test/image.png">'
    expect(toBrowserTicketReportHtml(external)).toBe(external)
    expect(toStoredTicketReportHtml(external)).toBe(external)
  })
})

describe('ticket comment image paths', () => {
  const apiPath = `/tickets/${ticketId}/comments/${commentId}/images/${imageId}`

  it('usa o BFF autenticado e restaura a rota canônica', () => {
    const browserHtml = toBrowserTicketReportHtml(`<img src="${apiPath}">`)
    expect(browserHtml).toBe(`<img src="/api/bff${apiPath}">`)
    expect(toStoredTicketReportHtml(browserHtml)).toBe(`<img src="${apiPath}">`)
  })
})
