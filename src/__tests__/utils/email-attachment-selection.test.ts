import {
  filterSelectableEmailAttachments,
  getEmailAttachmentBlockedReason,
  isBlockedEmailAttachment,
  isEmailAttachmentSelected,
  MAX_EMAIL_ATTACHMENT_BYTES,
} from '@/utils/email-attachment-selection'

describe('anexos selecionáveis na conversão de e-mail', () => {
  it('permite exatamente 20 MB e bloqueia acima de 20 MB', () => {
    expect(
      getEmailAttachmentBlockedReason({
        size: MAX_EMAIL_ATTACHMENT_BYTES,
        is_prepared: true,
      }),
    ).toBeNull()
    expect(
      getEmailAttachmentBlockedReason({
        size: MAX_EMAIL_ATTACHMENT_BYTES + 1,
        is_prepared: true,
      }),
    ).toContain('20 MB')
  })

  it('não aplica o limite ao tamanho original antes de comprimir', () => {
    expect(
      getEmailAttachmentBlockedReason({
        size: MAX_EMAIL_ATTACHMENT_BYTES + 1,
        is_prepared: false,
      }),
    ).toBeNull()
  })

  it('mantém arquivos acima do limite visíveis na lista', () => {
    const attachment = {
      filename: 'grande.pdf',
      size: MAX_EMAIL_ATTACHMENT_BYTES + 1,
    }
    expect(filterSelectableEmailAttachments([attachment])).toEqual([attachment])
  })

  it('respeita o bloqueio informado pela API', () => {
    expect(
      getEmailAttachmentBlockedReason({
        can_select: false,
        blocked_reason: 'Anexo indisponível.',
      }),
    ).toBe('Anexo indisponível.')
  })

  it('marca por padrão o anexo preparado e respeita a desmarcação manual', () => {
    const attachment = {
      id: 38,
      filename: 'mapa.pdf',
      size: 1024,
      is_prepared: true,
      can_select: true,
    }
    expect(isEmailAttachmentSelected(attachment, {})).toBe(true)
    expect(isEmailAttachmentSelected(attachment, { 38: false })).toBe(false)
    expect(isEmailAttachmentSelected(attachment, { 38: true })).toBe(true)
    expect(
      isEmailAttachmentSelected({ ...attachment, can_select: false }, {}),
    ).toBe(false)
    expect(
      isEmailAttachmentSelected({ ...attachment, is_prepared: false }, {}),
    ).toBe(false)
    expect(
      isEmailAttachmentSelected({ ...attachment, filename: 'video.mp4' }, {}),
    ).toBe(false)
  })
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
