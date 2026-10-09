import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExistingTicketAttachments } from '@/app/(app)/demandas/criar/components/shared/existing-ticket-attachments'
import { downloadTicketAttachmentFile } from '@/http/tickets/download-ticket-attachment'

jest.mock('@/http/tickets/download-ticket-attachment', () => ({
  downloadTicketAttachmentFile: jest.fn(),
}))

test('shows a saved ticket document and downloads it from the associated ticket', async () => {
  const attachment = {
    id: 'attachment-1',
    filename: 'oficio.pdf',
    size_bytes: 100,
    created_at: '2026-10-09T12:00:00Z',
  }
  jest.mocked(downloadTicketAttachmentFile).mockResolvedValue(undefined)

  render(
    <ExistingTicketAttachments
      ticketId="ticket-1"
      attachments={[attachment]}
      classNames={{ row: '', checkIcon: '', fileName: '', badge: '' }}
    />,
  )

  expect(screen.getByText('oficio.pdf')).toBeInTheDocument()
  expect(screen.getByText('Já anexado')).toBeInTheDocument()
  await userEvent.click(
    screen.getByRole('button', { name: 'Baixar oficio.pdf' }),
  )
  expect(downloadTicketAttachmentFile).toHaveBeenCalledWith(
    attachment,
    'ticket-1',
  )
})
