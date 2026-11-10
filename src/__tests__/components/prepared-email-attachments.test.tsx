import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'

import { usePreparedEmailAttachments } from '@/app/(app)/demandas/converter/hooks/use-prepared-email-attachments'
import {
  type AttachmentOut,
  prepareEmailAttachment,
} from '@/http/emails/get-email'

jest.mock('@/http/emails/get-email', () => ({
  prepareEmailAttachment: jest.fn(),
}))

const originals: AttachmentOut[] = [
  {
    id: 38,
    filename: 'photo.png',
    mime_type: 'image/png',
    size: 25 * 1024 * 1024,
    file_path: '',
  },
]

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        })
      }
    >
      {children}
    </QueryClientProvider>
  )
}

it('aguarda a compressão e usa o tamanho e a versão preparados para seleção', async () => {
  let resolvePreparation!: (
    value: Awaited<ReturnType<typeof prepareEmailAttachment>>,
  ) => void
  jest.mocked(prepareEmailAttachment).mockReturnValue(
    new Promise((resolve) => {
      resolvePreparation = resolve
    }) as ReturnType<typeof prepareEmailAttachment>,
  )
  const { result } = renderHook(
    () => usePreparedEmailAttachments('email-1', originals),
    { wrapper },
  )
  expect(result.current.isPreparing).toBe(true)
  expect(result.current.attachments[0].can_select).toBe(false)
  const prepared: AttachmentOut = {
    ...originals[0],
    original_size: originals[0].size,
    size: 1000,
    is_prepared: true,
    can_select: true,
    preparation_token: 'a'.repeat(64),
  }
  resolvePreparation({ data: prepared } as Awaited<
    ReturnType<typeof prepareEmailAttachment>
  >)
  await waitFor(() => expect(result.current.isPreparing).toBe(false))
  expect(result.current.attachments[0]).toEqual(prepared)
  expect(prepareEmailAttachment).toHaveBeenCalledWith('email-1', 38)
})

it('bloqueia o anexo e oferece nova tentativa quando a compressão falha', async () => {
  jest
    .mocked(prepareEmailAttachment)
    .mockRejectedValue(new Error('compression failed'))
  const { result } = renderHook(
    () => usePreparedEmailAttachments('email-1', originals),
    { wrapper },
  )
  await waitFor(() => expect(result.current.hasErrors).toBe(true))
  expect(result.current.attachments[0].can_select).toBe(false)
  expect(result.current.attachments[0].blocked_reason).toContain(
    'Tente novamente',
  )
})
