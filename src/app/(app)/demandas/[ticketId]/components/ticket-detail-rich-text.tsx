'use client'

import { Bold, Italic, Link2, Paperclip, Underline } from 'lucide-react'
import { type MouseEvent, type RefObject, useEffect, useState } from 'react'

import styles from '../ticket-detail.module.css'

export const TICKET_REPORT_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp'
export const TICKET_REPORT_IMAGE_MAX_BYTES = 10 * 1024 * 1024
export const TICKET_REPORT_IMAGE_MAX_SIZE_ERROR =
  'A imagem não pode ter mais de 10 MB.'

type ClipboardItemWithFile = Pick<DataTransferItem, 'type' | 'getAsFile'>

export function getTicketReportClipboardImages(
  items: ArrayLike<ClipboardItemWithFile>,
): File[] {
  const acceptedTypes = new Set(TICKET_REPORT_IMAGE_ACCEPT.split(','))

  return Array.from(items).flatMap((item) => {
    if (!acceptedTypes.has(item.type)) return []
    const file = item.getAsFile()
    return file ? [file] : []
  })
}

export function getTicketReportImageValidationError(file: File): string | null {
  if (!TICKET_REPORT_IMAGE_ACCEPT.split(',').includes(file.type)) {
    return 'Use imagens JPEG, PNG, GIF ou WebP.'
  }
  if (file.size > TICKET_REPORT_IMAGE_MAX_BYTES) {
    return TICKET_REPORT_IMAGE_MAX_SIZE_ERROR
  }
  return null
}

/** Prepara imagens embutidas no HTML do clipboard para o upload multipart. */
export function prepareTicketReportClipboardHtml(html: string): {
  content: HTMLDivElement
  images: { element: HTMLImageElement; file: File }[]
} | null {
  const content = document.createElement('div')
  content.innerHTML = sanitizeTicketHtml(html)
  const embeddedImages = Array.from(content.querySelectorAll('img')).filter(
    (image) => /^data:/i.test((image.getAttribute('src') || '').trim()),
  )
  if (embeddedImages.length === 0) return null

  const images = embeddedImages.map((element, index) => {
    const source = (element.getAttribute('src') || '').trim()
    const match =
      /^data:(image\/(?:jpeg|png|gif|webp));base64,([\s\S]+)$/i.exec(source)
    if (!match) {
      throw new Error(
        'Use imagens JPEG, PNG, GIF ou WebP em base64 ao colar HTML.',
      )
    }
    const encoded = match[2].replace(/\s/g, '')
    if (encoded.length > Math.ceil(TICKET_REPORT_IMAGE_MAX_BYTES / 3) * 4) {
      throw new Error(TICKET_REPORT_IMAGE_MAX_SIZE_ERROR)
    }
    let decoded: string
    try {
      decoded = atob(encoded)
    } catch {
      throw new Error('A imagem colada contém base64 inválido.')
    }
    if (!decoded.length) throw new Error('A imagem colada está vazia.')
    const bytes = Uint8Array.from(decoded, (character) =>
      character.charCodeAt(0),
    )
    const type = match[1].toLowerCase()
    const extension = type === 'image/jpeg' ? 'jpg' : type.split('/')[1]
    const file = new File([bytes], `imagem-colada-${index + 1}.${extension}`, {
      type,
    })
    const error = getTicketReportImageValidationError(file)
    if (error) throw new Error(error)
    return { element, file }
  })

  return { content, images }
}

export function insertTicketReportClipboardHtml(
  html: string,
  editor: HTMLElement,
  pendingImages: Map<string, File>,
): boolean {
  const prepared = prepareTicketReportClipboardHtml(html)
  if (!prepared) return false
  for (const { element, file } of prepared.images) {
    const blobUrl = URL.createObjectURL(file)
    pendingImages.set(blobUrl, file)
    element.setAttribute('src', blobUrl)
  }
  const fragment = document.createDocumentFragment()
  fragment.append(...Array.from(prepared.content.childNodes))
  insertNodeAtCaret(editor, fragment)
  return true
}

export function removeTicketReportImageLoaderState(root: ParentNode): void {
  for (const image of root.querySelectorAll('img')) {
    image.classList.remove(styles.ticketReportImageLoading)
    image.removeAttribute('aria-busy')
    if (!image.getAttribute('class')) image.removeAttribute('class')
  }
}

export function useTicketReportImageLoaders(
  editorRef: RefObject<HTMLElement>,
  editorMounted: boolean,
): void {
  useEffect(() => {
    if (!editorMounted) return
    const editor = editorRef.current
    if (!editor) return

    const syncImageLoaders = () => {
      for (const image of editor.querySelectorAll('img')) {
        const isPending = !image.complete
        image.classList.toggle(styles.ticketReportImageLoading, isPending)
        if (isPending) image.setAttribute('aria-busy', 'true')
        else image.removeAttribute('aria-busy')
      }
    }
    const finishImageLoading = (event: Event) => {
      if (!(event.target instanceof HTMLImageElement)) return
      event.target.classList.remove(styles.ticketReportImageLoading)
      event.target.removeAttribute('aria-busy')
    }

    const observer = new MutationObserver(syncImageLoaders)
    observer.observe(editor, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src'],
    })
    editor.addEventListener('load', finishImageLoading, true)
    editor.addEventListener('error', finishImageLoading, true)
    syncImageLoaders()

    return () => {
      observer.disconnect()
      editor.removeEventListener('load', finishImageLoading, true)
      editor.removeEventListener('error', finishImageLoading, true)
    }
  }, [editorMounted, editorRef])
}

export function insertNodeAtCaret(editor: HTMLElement, node: Node) {
  const lastNode = node instanceof DocumentFragment ? node.lastChild : node
  if (!lastNode) return
  editor.focus()
  const selection = window.getSelection()
  if (
    selection?.rangeCount &&
    selection.anchorNode &&
    editor.contains(selection.anchorNode)
  ) {
    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)
    range.setStartAfter(lastNode)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    return
  }

  editor.appendChild(node)
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function nodeInsideEditorLink(node: Node, editor: HTMLElement): boolean {
  let el: Node | null =
    node.nodeType === Node.TEXT_NODE ? node.parentElement : node
  if (el && el.nodeType !== Node.ELEMENT_NODE) {
    el = (el as ChildNode).parentElement
  }
  while (el && el !== editor) {
    if (el instanceof HTMLAnchorElement) return true
    el = el.parentElement
  }
  return false
}

function selectionTouchesLinkInEditor(editor: HTMLElement): boolean {
  const sel = window.getSelection()
  if (!sel?.anchorNode || !editor.contains(sel.anchorNode)) return false
  const nodes = [sel.anchorNode, sel.focusNode].filter(Boolean) as Node[]
  return nodes.some(
    (n) => editor.contains(n) && nodeInsideEditorLink(n, editor),
  )
}

function isIgnorableUrlCharacter(character: string): boolean {
  const codePoint = character.codePointAt(0)
  if (codePoint === undefined) return false
  return (
    codePoint <= 0x20 ||
    (codePoint >= 0x7f && codePoint <= 0x9f) ||
    (codePoint >= 0x200b && codePoint <= 0x200f) ||
    (codePoint >= 0x202a && codePoint <= 0x202e) ||
    (codePoint >= 0x2060 && codePoint <= 0x206f) ||
    codePoint === 0xfeff
  )
}

export function sanitizeTicketHtml(html: string): string {
  if (typeof window === 'undefined') return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc
    .querySelectorAll(
      'script, style, iframe, object, embed, svg, math, form, base, link, meta, template',
    )
    .forEach((el) => {
      el.remove()
    })
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name)
        continue
      }

      if (name === 'href' || name === 'src') {
        const normalized = Array.from(attr.value)
          .filter((character) => !isIgnorableUrlCharacter(character))
          .join('')
          .toLowerCase()
        const activeScheme =
          normalized.startsWith('javascript:') ||
          normalized.startsWith('vbscript:')
        const executableLink =
          el.tagName === 'A' && normalized.startsWith('data:')
        if (activeScheme || executableLink) {
          el.removeAttribute(attr.name)
        }
      }
    }

    if (el.tagName === 'A' && el.getAttribute('target') === '_blank') {
      el.setAttribute('rel', 'noopener noreferrer')
    }
  })
  return doc.body.innerHTML
}

export function isHtmlEffectivelyEmpty(html: string): boolean {
  if (typeof window === 'undefined') {
    return html.replace(/\s/g, '').length === 0
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const text = (doc.body.textContent || '').replace(/\u00a0/g, ' ').trim()
  if (text.length > 0) return false
  return doc.body.querySelector('img') == null
}

export function RichToolbar({
  onCommand,
  attachmentDisabled = true,
  onInsertImage,
  editorRef,
}: {
  onCommand: (command: string, value?: string) => void
  attachmentDisabled?: boolean
  /** Quando definido, o botão de anexo abre inserção de imagem (ex.: relatório de demanda). */
  onInsertImage?: () => void
  /** Área contentEditable: usado para realçar o botão de link quando o cursor está num link. */
  editorRef?: RefObject<HTMLDivElement | null>
}) {
  const [linkActive, setLinkActive] = useState(false)

  useEffect(() => {
    if (!editorRef) return

    const sync = () => {
      const editor = editorRef.current
      setLinkActive(editor ? selectionTouchesLinkInEditor(editor) : false)
    }

    sync()
    document.addEventListener('selectionchange', sync)
    return () => document.removeEventListener('selectionchange', sync)
  }, [editorRef])

  const preventBlur = (e: MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div className={styles.parecerToolbar}>
      <div className={styles.parecerToolbarGroup}>
        <button
          type="button"
          className={styles.parecerToolbarBtn}
          aria-label="Negrito"
          onMouseDown={preventBlur}
          onClick={() => onCommand('bold')}
        >
          <Bold size={16} strokeWidth={2.25} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.parecerToolbarBtn}
          aria-label="Itálico"
          onMouseDown={preventBlur}
          onClick={() => onCommand('italic')}
        >
          <Italic size={16} strokeWidth={2.25} aria-hidden />
        </button>
        <button
          type="button"
          className={styles.parecerToolbarBtn}
          aria-label="Sublinhado"
          onMouseDown={preventBlur}
          onClick={() => onCommand('underline')}
        >
          <Underline size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      <span className={styles.parecerToolbarDivider} aria-hidden />
      <div className={styles.parecerToolbarGroup}>
        <button
          type="button"
          className={`${styles.parecerToolbarBtn}${linkActive ? ` ${styles.parecerToolbarBtnActive}` : ''}`}
          aria-label="Inserir link"
          aria-pressed={linkActive}
          onMouseDown={preventBlur}
          onClick={() => {
            const url = window.prompt('URL do link')
            if (url?.trim()) onCommand('createLink', url.trim())
          }}
        >
          <Link2 size={16} strokeWidth={2.25} aria-hidden />
        </button>
      </div>
      <div className={styles.parecerToolbarSpacer} />
      <button
        type="button"
        className={styles.parecerToolbarBtn}
        aria-label={onInsertImage ? 'Inserir imagem' : 'Anexar arquivo'}
        disabled={attachmentDisabled}
        title={
          attachmentDisabled
            ? onInsertImage
              ? undefined
              : 'Em breve'
            : onInsertImage
              ? 'Inserir imagem no relatório'
              : undefined
        }
        onMouseDown={onInsertImage ? preventBlur : undefined}
        onClick={() => {
          if (attachmentDisabled || !onInsertImage) return
          onInsertImage()
        }}
      >
        <Paperclip size={16} strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}
