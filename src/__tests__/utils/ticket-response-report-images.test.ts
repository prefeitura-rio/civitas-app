import {
  toBrowserTicketReportHtml,
  toStoredTicketReportHtml,
} from '@/utils/ticket-report-images'

const ticketId = '11111111-1111-1111-1111-111111111111'
const imageId = '22222222-2222-2222-2222-222222222222'
describe.each(['demand', 'response'])(
  'ticket %s report image paths',
  (report) => {
    const apiPath = `/tickets/${ticketId}/${report}-report/images/${imageId}`

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
  },
)
