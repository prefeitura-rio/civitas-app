import { isAllowedTicketAttachment } from '@/utils/ticket-attachment-validation'

describe('validação de extensões no upload de anexos', () => {
  it.each([
    'arquivo.pdf',
    'arquivo.doc',
    'arquivo.docx',
    'arquivo.xls',
    'arquivo.xlsx',
    'arquivo.jpeg',
    'arquivo.JPG',
    'arquivo.png',
  ])('aceita %s', (filename) => {
    expect(isAllowedTicketAttachment(filename)).toBe(true)
  })

  it.each(['arquivo.mp4', 'arquivo.mov', 'arquivo.gif', 'arquivo.svg'])(
    'rejeita %s',
    (filename) => {
      expect(isAllowedTicketAttachment(filename)).toBe(false)
    },
  )
})
