import {
  canPreviewAttachment,
  isPreviewableContentType,
} from '@/utils/can-preview-attachment'

describe('Documentos recebidos - preview de anexos', () => {
  it('não permite preview de arquivos não suportados', () => {
    expect(canPreviewAttachment('planilha.xls')).toBe(false)
    expect(canPreviewAttachment('PLANILHA.XLSX')).toBe(false)
    expect(canPreviewAttachment('video.mp4')).toBe(false)
    expect(canPreviewAttachment('VIDEO.MOV')).toBe(false)
    expect(canPreviewAttachment('imagem.svg')).toBe(false)
    expect(canPreviewAttachment('animacao.gif')).toBe(false)
    expect(canPreviewAttachment('foto.webp')).toBe(false)
  })

  it('mantém preview para PDF e imagens', () => {
    expect(canPreviewAttachment('documento.pdf')).toBe(true)
    expect(canPreviewAttachment('foto.png')).toBe(true)
    expect(canPreviewAttachment('foto.jpeg')).toBe(true)
  })

  it('só mostra o tipo que a API confirmou', () => {
    expect(isPreviewableContentType('image/jpeg')).toBe(true)
    expect(isPreviewableContentType('image/png')).toBe(true)
    expect(isPreviewableContentType('application/pdf')).toBe(true)
    expect(isPreviewableContentType('application/octet-stream')).toBe(false)
    expect(isPreviewableContentType('text/html')).toBe(false)
  })
})
