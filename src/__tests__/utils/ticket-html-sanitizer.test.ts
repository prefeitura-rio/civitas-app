import {
  buildTicketReportUpload,
  getTicketReportClipboardImages,
  getTicketReportImageValidationError,
  insertNodeAtCaret,
  insertTicketReportClipboardHtml,
  prepareTicketReportClipboardHtml,
  releaseTicketReportImages,
  removeTicketReportImageLoaderState,
  sanitizeTicketHtml,
  TICKET_REPORT_IMAGE_MAX_BYTES,
  TICKET_REPORT_IMAGE_MAX_SIZE_ERROR,
} from '@/app/(app)/demandas/[ticketId]/components/ticket-detail-rich-text'

describe('sanitizeTicketHtml', () => {
  it('removes executable URL schemes, including encoded schemes', () => {
    const sanitized = sanitizeTicketHtml(
      '<a href=javascript:alert(1)>um</a>' +
        '<a href="&#x6a;avascript:alert(2)">dois</a>' +
        '<a href="data:text/html,<script>alert(3)</script>">três</a>',
    )

    expect(sanitized).not.toContain('javascript:')
    expect(sanitized).not.toContain('data:text/html')
    expect(sanitized).toContain('<a>um</a>')
    expect(sanitized).toContain('<a>dois</a>')
  })

  it('keeps safe links and protects links opened in a new tab', () => {
    const sanitized = sanitizeTicketHtml(
      '<a href="https://civitas.rio" target="_blank">Civitas</a>',
    )

    expect(sanitized).toContain('href="https://civitas.rio"')
    expect(sanitized).toContain('rel="noopener noreferrer"')
  })
})

describe('getTicketReportClipboardImages', () => {
  it('retorna todas as imagens suportadas na ordem do clipboard', () => {
    const first = new File(['first'], 'first.png', { type: 'image/png' })
    const second = new File(['second'], 'second.webp', { type: 'image/webp' })
    const text = new File(['text'], 'note.txt', { type: 'text/plain' })
    const items = [
      { type: first.type, getAsFile: () => first },
      { type: text.type, getAsFile: () => text },
      { type: second.type, getAsFile: () => second },
      { type: 'image/jpeg', getAsFile: () => null },
    ]

    expect(getTicketReportClipboardImages(items)).toEqual([first, second])
  })
})

describe('getTicketReportImageValidationError', () => {
  it('aceita uma imagem exatamente no limite de 10 MB', () => {
    const file = new File([], 'imagem.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', {
      value: TICKET_REPORT_IMAGE_MAX_BYTES,
    })

    expect(getTicketReportImageValidationError(file)).toBeNull()
  })

  it('retorna o aviso padrão acima de 10 MB', () => {
    const file = new File([], 'imagem.png', { type: 'image/png' })
    Object.defineProperty(file, 'size', {
      value: TICKET_REPORT_IMAGE_MAX_BYTES + 1,
    })

    expect(getTicketReportImageValidationError(file)).toBe(
      TICKET_REPORT_IMAGE_MAX_SIZE_ERROR,
    )
  })
})

describe('removeTicketReportImageLoaderState', () => {
  it('não persiste estado visual de carregamento no HTML', () => {
    const root = document.createElement('div')
    root.innerHTML =
      '<img class="outra-classe ticketReportImageLoading" aria-busy="true">'

    removeTicketReportImageLoaderState(root)

    expect(root.innerHTML).not.toContain('aria-busy')
    expect(root.innerHTML).not.toContain('ticketReportImageLoading')
    expect(root.innerHTML).toContain('outra-classe')
  })
})

describe('prepareTicketReportClipboardHtml', () => {
  it('converte imagens do HTML em arquivos mantendo texto, formatação e ordem', async () => {
    const prepared = prepareTicketReportClipboardHtml(
      '<p><strong>Antes</strong></p><img alt="mapa" src="data:image/png;base64,aGVsbG8=">' +
        '<p>Entre</p><img src="data:image/jpeg;base64,d29ybGQ="><p>Depois</p>',
    )!

    expect(prepared.content.textContent).toBe('AntesEntreDepois')
    expect(prepared.content.querySelector('strong')?.textContent).toBe('Antes')
    expect(prepared.images.map(({ file }) => file.type)).toEqual([
      'image/png',
      'image/jpeg',
    ])
    expect(prepared.images.map(({ file }) => file.size)).toEqual([5, 5])
    const readFile = (file: File) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(file)
      })
    expect(
      await Promise.all(prepared.images.map(({ file }) => readFile(file))),
    ).toEqual(['hello', 'world'])
    prepared.images.forEach(({ element }, index) => {
      element.src = `blob:imagem-${index}`
    })
    expect(prepared.content.innerHTML).not.toContain('base64')
    expect(prepared.content.querySelectorAll('img')[0].alt).toBe('mapa')
    expect(
      Array.from(prepared.content.children).map((el) => el.tagName),
    ).toEqual(['P', 'IMG', 'P', 'IMG', 'P'])
  })

  it('mantém o fluxo normal para texto e HTML sem imagens embutidas', () => {
    expect(prepareTicketReportClipboardHtml('')).toBeNull()
    expect(prepareTicketReportClipboardHtml('<p>Texto</p>')).toBeNull()
    expect(
      prepareTicketReportClipboardHtml('<img src="/tickets/imagem">'),
    ).toBeNull()
  })

  it.each([
    ['data:image/png;base64,%%%!', 'base64 inválido'],
    ['data:image/svg+xml;base64,PHN2Zz4=', 'JPEG, PNG, GIF ou WebP'],
  ])('recusa %s antes de inserir o conteúdo', (source, message) => {
    expect(() =>
      prepareTicketReportClipboardHtml(`<img src="${source}">`),
    ).toThrow(message)
  })

  it('recusa imagens acima de 10 MB antes de decodificá-las', () => {
    const encoded = 'A'.repeat(
      Math.ceil(TICKET_REPORT_IMAGE_MAX_BYTES / 3) * 4 + 4,
    )
    expect(() =>
      prepareTicketReportClipboardHtml(
        `<img src="data:image/png;base64,${encoded}">`,
      ),
    ).toThrow(TICKET_REPORT_IMAGE_MAX_SIZE_ERROR)
  })

  it('sanitiza o HTML colado antes da inserção no editor', () => {
    const prepared = prepareTicketReportClipboardHtml(
      '<script>alert(1)</script><img onerror="alert(1)" src="data:image/png;base64,aGVsbG8=">',
    )!
    expect(prepared.content.innerHTML).not.toContain('script')
    expect(prepared.content.innerHTML).not.toContain('onerror')
  })
})

describe('insertNodeAtCaret', () => {
  it('insere um fragmento com texto e imagem na seleção e posiciona o cursor depois', () => {
    const editor = document.createElement('div')
    editor.contentEditable = 'true'
    editor.innerHTML = '<p>AntesDepois</p>'
    document.body.appendChild(editor)
    try {
      const range = document.createRange()
      range.setStart(editor.firstChild!.firstChild!, 5)
      range.collapse(true)
      window.getSelection()!.removeAllRanges()
      window.getSelection()!.addRange(range)
      const fragment = document.createDocumentFragment()
      fragment.append(
        document.createTextNode('Texto colado'),
        document.createElement('img'),
      )
      insertNodeAtCaret(editor, fragment)
      expect(editor.innerHTML).toBe('<p>AntesTexto colado<img>Depois</p>')
      const selection = window.getSelection()!.getRangeAt(0)
      expect(selection.collapsed).toBe(true)
      expect(selection.startContainer).toBe(editor.firstChild)
      expect(selection.startOffset).toBe(3)
    } finally {
      editor.remove()
      window.getSelection()!.removeAllRanges()
    }
  })
})

describe('insertTicketReportClipboardHtml', () => {
  it('registra os arquivos para upload e insere texto e URLs locais no editor', () => {
    const originalCreateObjectURL = URL.createObjectURL
    URL.createObjectURL = jest.fn(() => 'blob:imagem-colada')
    const editor = document.createElement('div')
    const pending = new Map<string, File>()
    try {
      expect(
        insertTicketReportClipboardHtml(
          '<p>Resultado</p><img src="data:image/png;base64,aGVsbG8=">',
          editor,
          pending,
        ),
      ).toBe(true)
      expect(editor.innerHTML).toBe(
        '<p>Resultado</p><img src="blob:imagem-colada">',
      )
      expect(pending.get('blob:imagem-colada')).toBeInstanceOf(File)
      expect(pending.get('blob:imagem-colada')?.type).toBe('image/png')
      expect(pending.get('blob:imagem-colada')?.size).toBe(5)
    } finally {
      URL.createObjectURL = originalCreateObjectURL
    }
  })

  it('preserva o editor e os uploads quando alguma imagem da colagem é inválida', () => {
    const editor = document.createElement('div')
    editor.innerHTML = '<p>Conteúdo existente</p>'
    const pending = new Map<string, File>()
    expect(() =>
      insertTicketReportClipboardHtml(
        '<img src="data:image/png;base64,aGVsbG8="><img src="data:image/png;base64,%%%">',
        editor,
        pending,
      ),
    ).toThrow('base64 inválido')
    expect(editor.innerHTML).toBe('<p>Conteúdo existente</p>')
    expect(pending.size).toBe(0)
  })
})

describe('buildTicketReportUpload', () => {
  it.each([
    ['demand', '__DEMAND_IMG_'],
    ['response', '__RESPONSE_IMG_'],
    ['comment', '__COMMENT_IMG_'],
  ] as const)(
    'preserva o contrato de upload de %s sem alterar o editor',
    (kind, prefix) => {
      const editor = document.createElement('div')
      const path =
        '/tickets/11111111-1111-1111-1111-111111111111/response-report/images/22222222-2222-2222-2222-222222222222'
      editor.innerHTML = `<p>Texto</p><img src="/api/bff${path}"><img src="blob:new" aria-busy="true" class="ticketReportImageLoading"><img src="blob:new"><img src="data:image/png;base64,aGVsbG8=">`
      const original = editor.innerHTML
      const file = new File(['image'], 'image.png', { type: 'image/png' })
      const removed = new File(['removed'], 'removed.png', {
        type: 'image/png',
      })
      const pending = new Map([
        ['blob:new', file],
        ['blob:removed', removed],
      ])

      const result = buildTicketReportUpload(editor, pending, kind)

      expect(result.files).toEqual([file, file])
      expect(result.html_content).toContain(`src="${prefix}0__"`)
      expect(result.html_content).toContain(`src="${prefix}1__"`)
      expect(result.html_content).toContain(`src="${path}"`)
      expect(result.html_content).toContain('data:image/png;base64,aGVsbG8=')
      expect(result.html_content).not.toMatch(
        /blob:|aria-busy|ticketReportImageLoading/,
      )
      expect(editor.innerHTML).toBe(original)
      expect(pending.size).toBe(2)
    },
  )
})

describe('releaseTicketReportImages', () => {
  it('libera apenas órfãs durante a edição e todas após salvar ou descartar', () => {
    const originalRevokeObjectURL = URL.revokeObjectURL
    URL.revokeObjectURL = jest.fn()
    const editor = document.createElement('div')
    editor.innerHTML = '<img src="blob:used">'
    const file = new File(['image'], 'image.png', { type: 'image/png' })
    const pending = new Map([
      ['blob:used', file],
      ['blob:removed', file],
    ])
    try {
      releaseTicketReportImages(pending, editor)
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1)
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:removed')
      expect([...pending.keys()]).toEqual(['blob:used'])
      releaseTicketReportImages(pending)
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2)
      expect(URL.revokeObjectURL).toHaveBeenLastCalledWith('blob:used')
      expect(pending.size).toBe(0)
    } finally {
      URL.revokeObjectURL = originalRevokeObjectURL
    }
  })
})
