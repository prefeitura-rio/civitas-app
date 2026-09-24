import {
  filterSelectableEmailAttachments,
  isBlockedEmailAttachment,
} from '@/utils/email-attachment-selection'

describe('anexos selecionáveis na conversão de e-mail', () => {
  it.each(['video.mp4', 'VIDEO.MP4', 'video.mov', 'VIDEO.MOV'])(
    'bloqueia %s',
    (filename) => {
      expect(isBlockedEmailAttachment(filename)).toBe(true)
    },
  )

  it('mantém os outros formatos disponíveis para seleção', () => {
    const attachments = [
      { id: 'pdf', filename: 'documento.pdf' },
      { id: 'mp4', filename: 'video.mp4' },
      { id: 'jpg', filename: 'foto.jpg' },
      { id: 'mov', filename: 'VIDEO.MOV' },
      { id: 'xlsx', filename: 'planilha.xlsx' },
    ]

    expect(filterSelectableEmailAttachments(attachments)).toEqual([
      { id: 'pdf', filename: 'documento.pdf' },
      { id: 'jpg', filename: 'foto.jpg' },
      { id: 'xlsx', filename: 'planilha.xlsx' },
    ])
  })
})
