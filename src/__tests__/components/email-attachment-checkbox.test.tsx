import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmailAttachmentCheckbox } from '@/app/(app)/demandas/converter/components/email-attachment-checkbox'
import { MAX_EMAIL_ATTACHMENT_BYTES } from '@/utils/email-attachment-selection'

const attachment = {
  id: 1,
  filename: 'grande.pdf',
  size: MAX_EMAIL_ATTACHMENT_BYTES + 1,
  file_path: '',
  mime_type: 'application/pdf',
  is_prepared: true,
}

it('mostra o anexo recebido, bloqueia a seleção e explica o limite no hover', async () => {
  const onToggle = jest.fn()
  render(
    <EmailAttachmentCheckbox
      attachment={attachment}
      selected={false}
      disabled={false}
      onToggle={onToggle}
    />,
  )
  const checkbox = screen.getByRole('button', {
    name: 'Incluir anexo do e-mail grande.pdf',
  })
  expect(checkbox).toBeDisabled()
  expect(checkbox.parentElement).toHaveAttribute(
    'title',
    expect.stringContaining('maior que o permitido'),
  )
  await userEvent.setup().hover(checkbox.parentElement!)
  await userEvent.setup().click(checkbox)
  expect(onToggle).not.toHaveBeenCalled()
  expect(checkbox).toHaveAttribute('aria-pressed', 'false')
})

it('permite marcar um anexo com exatamente 20 MB', async () => {
  const onToggle = jest.fn()
  render(
    <EmailAttachmentCheckbox
      attachment={{ ...attachment, size: MAX_EMAIL_ATTACHMENT_BYTES }}
      selected={false}
      disabled={false}
      onToggle={onToggle}
    />,
  )
  const checkbox = screen.getByRole('button')
  expect(checkbox).not.toBeDisabled()
  await userEvent.setup().click(checkbox)
  expect(onToggle).toHaveBeenCalledWith(1)
})

it('não mantém um anexo bloqueado marcado após atualização da API', () => {
  render(
    <EmailAttachmentCheckbox
      attachment={attachment}
      selected
      disabled={false}
      onToggle={jest.fn()}
    />,
  )
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
})
