import { canPreviewAttachment } from '@/app/(app)/demandas/[ticketId]/components/ticket-detail-tab-documentos'

describe('Documentos recebidos - preview de anexos', () => {
  it('não permite preview de arquivos Excel', () => {
    expect(canPreviewAttachment('planilha.xls')).toBe(false)
    expect(canPreviewAttachment('PLANILHA.XLSX')).toBe(false)
    expect(canPreviewAttachment('video.mp4')).toBe(false)
    expect(canPreviewAttachment('VIDEO.MOV')).toBe(false)
  })

  it('mantém preview para PDF e imagens', () => {
    expect(canPreviewAttachment('documento.pdf')).toBe(true)
    expect(canPreviewAttachment('foto.png')).toBe(true)
    expect(canPreviewAttachment('foto.jpeg')).toBe(true)
  })
})
