import { act, renderHook, waitFor } from '@testing-library/react'

import { usePreparedManualAttachments } from '@/app/(app)/demandas/converter/hooks/use-prepared-manual-attachments'
import { prepareManualTicketAttachment } from '@/http/tickets/prepare-manual-ticket-attachment'

jest.mock('@/http/tickets/prepare-manual-ticket-attachment', () => ({
  prepareManualTicketAttachment: jest.fn(),
}))

const prepare = prepareManualTicketAttachment as jest.MockedFunction<
  typeof prepareManualTicketAttachment
>

function largeFile() {
  return new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'mapa.pdf', {
    type: 'application/pdf',
  })
}

beforeEach(() => prepare.mockReset())

it('prepara o arquivo antes de salvar e envia os bytes preparados', async () => {
  const original = largeFile()
  const compressed = new File(['pdf compacto'], original.name, {
    type: original.type,
  })
  const hash = 'a'.repeat(64)
  prepare.mockResolvedValue({ file: compressed, hash })

  const { result } = renderHook(() => usePreparedManualAttachments([original]))
  expect(result.current.isPreparing).toBe(true)
  await waitFor(() =>
    expect(result.current.preparations.get(original)?.status).toBe('ready'),
  )
  expect(result.current.isPreparing).toBe(false)
  expect(result.current.filesForUpload([original])).toEqual({
    files: [compressed],
    preparedFileHashes: { 0: hash },
  })
})

it('permite tentar novamente após falha na preparação', async () => {
  const original = largeFile()
  const compressed = new File(['pdf compacto'], original.name)
  prepare
    .mockRejectedValueOnce(new Error('Falha na compactação'))
    .mockResolvedValueOnce({ file: compressed, hash: 'b'.repeat(64) })

  const { result } = renderHook(() => usePreparedManualAttachments([original]))
  await waitFor(() =>
    expect(result.current.preparations.get(original)?.status).toBe('error'),
  )
  expect(result.current.isPreparingFor([original])).toBe(false)
  expect(result.current.filesForUpload([original])).toEqual({
    files: [original],
    preparedFileHashes: {},
  })
  act(() => result.current.retry(original))
  await waitFor(() =>
    expect(result.current.preparations.get(original)?.status).toBe('ready'),
  )
  expect(prepare).toHaveBeenCalledTimes(2)
})

it('mantém arquivos rejeitados pela API bloqueados para envio', async () => {
  const original = largeFile()
  prepare.mockRejectedValue({
    isAxiosError: true,
    response: { status: 400, data: { detail: 'Arquivo inválido.' } },
  })

  const { result } = renderHook(() => usePreparedManualAttachments([original]))
  await waitFor(() =>
    expect(result.current.preparations.get(original)?.status).toBe('invalid'),
  )
  expect(result.current.hasInvalidFor([original])).toBe(true)
})
