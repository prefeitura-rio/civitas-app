import { api } from '@/lib/api'

export async function prepareManualTicketAttachment(file: File) {
  const form = new FormData()
  form.append('file', file)
  const response = await api.post<Blob>('/tickets/attachments/prepare', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'blob',
  })
  const hash = response.headers['x-prepared-sha256']
  if (typeof hash !== 'string' || !/^[a-f0-9]{64}$/.test(hash)) {
    throw new Error(
      'A preparação do arquivo não retornou um identificador válido.',
    )
  }
  return {
    file: new File([response.data], file.name, {
      type: response.data.type || file.type,
      lastModified: file.lastModified,
    }),
    hash,
  }
}
