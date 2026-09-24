import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { toast } from 'sonner'

import { EmailPreviewSheet } from '@/app/(app)/demandas/caixa-entrada/components/email-preview-sheet'
import { useAttachmentPreviewUrl } from '@/app/(app)/demandas/converter/hooks/use-attachment-preview-url'
import { fetchEmailAttachmentBlob } from '@/http/emails/download-email-attachment'
import { getEmailById } from '@/http/emails/get-email'
import { api } from '@/lib/api'

jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

jest.mock('@/http/emails/get-email', () => ({
  getEmailById: jest.fn(),
}))

jest.mock('@/http/emails/download-email-attachment', () => ({
  fetchEmailAttachmentBlob: jest.fn(),
  downloadEmailAttachmentFile: jest.fn(),
}))

jest.mock('@/http/emails/mark-email-spam', () => ({
  markEmailAsSpam: jest.fn(),
}))

jest.mock('@/lib/api', () => ({
  api: { get: jest.fn() },
}))

const fakeJpg = {
  id: 1,
  filename: 'foto.jpg',
  mime_type: 'image/jpeg',
  size: 209,
  file_path: 'emails/1/foto.jpg',
}

function renderSheet() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return render(
    <EmailPreviewSheet open onOpenChange={jest.fn()} emailId="email-1" />,
    { wrapper: Wrapper },
  )
}

describe('foto.jpg que a API não confirma como foto', () => {
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:preview')
    URL.revokeObjectURL = jest.fn()
    jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('não abre nem baixa ao clicar no olho da caixa de entrada', async () => {
    jest.mocked(getEmailById).mockResolvedValue({
      data: {
        id: 'email-1',
        subject: 'smoke',
        from_name: 'Nicolas',
        from_address: 'n@example.com',
        snippet: 'corpo',
        has_attachments: true,
        is_read: false,
        created_at: '2026-09-24T00:00:00Z',
        updated_at: '2026-09-24T00:00:00Z',
        attachments: [fakeJpg],
      },
    } as Awaited<ReturnType<typeof getEmailById>>)
    jest.mocked(fetchEmailAttachmentBlob).mockResolvedValue({
      blob: { type: 'application/octet-stream' } as Blob,
      contentType: 'image/jpeg',
    })

    const user = userEvent.setup()
    renderSheet()

    await user.click(
      await screen.findByRole('button', { name: 'Visualizar foto.jpg' }),
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    expect(URL.createObjectURL).not.toHaveBeenCalled()
    expect(window.open).not.toHaveBeenCalled()
  })

  it('não monta preview na conversão', async () => {
    jest.mocked(api.get).mockResolvedValue({
      data: { type: 'application/octet-stream' },
    })

    const { result } = renderHook(() =>
      useAttachmentPreviewUrl(fakeJpg, 'email-1'),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.unavailable).toBe(true)
    expect(result.current.url).toBeNull()
    expect(URL.createObjectURL).not.toHaveBeenCalled()
  })
})
