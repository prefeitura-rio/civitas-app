import { addConventionalPendingAttachments } from '@/http/tickets/add-conventional-pending-attachments'
import { convertTicketToConventional } from '@/http/tickets/convert-ticket-to-conventional'
import { createTicket } from '@/http/tickets/create-ticket'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({ api: { post: jest.fn() } }))

const payload = {
  email_id: 'email-1',
  email_attachment_ids: [38],
  email_attachment_tokens: { 38: 'a'.repeat(64) },
}

beforeEach(() => {
  jest.mocked(api.post).mockClear()
  jest.mocked(api.post).mockResolvedValue({ data: { id: 'ticket-1' } })
})

it.each([
  ['criar demanda', () => createTicket(payload)],
  ['converter demanda', () => convertTicketToConventional('ticket-1', payload)],
  [
    'associar demanda',
    () => addConventionalPendingAttachments('ticket-1', payload, []),
  ],
] as const)(
  '%s envia os identificadores dos anexos sem reenviar seus bytes',
  async (_name, submit) => {
    await submit()
    const form = jest.mocked(api.post).mock.calls[0][1] as FormData
    expect(JSON.parse(form.get('payload') as string)).toEqual(payload)
    expect(form.getAll('files')).toEqual([])
  },
)

it('envia somente os arquivos adicionados manualmente junto aos identificadores do email', async () => {
  const manual = new File(['manual'], 'manual.pdf', { type: 'application/pdf' })
  await createTicket(payload, [manual])
  const form = jest.mocked(api.post).mock.calls[0][1] as FormData
  expect(form.getAll('files')).toEqual([manual])
  expect(
    JSON.parse(form.get('payload') as string).email_attachment_ids,
  ).toEqual([38])
})
