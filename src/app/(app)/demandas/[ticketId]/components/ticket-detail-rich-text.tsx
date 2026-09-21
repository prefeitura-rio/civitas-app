'use client'

import { Bold, Italic, Link2, Paperclip, Underline } from 'lucide-react'
import { type MouseEvent, type RefObject, useEffect, useState } from 'react'

import styles from '../ticket-detail.module.css'

export const TICKET_REPORT_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/gif,image/webp'
export const TICKET_REPORT_IMAGE_MAX_BYTES = 10 * 1024 * 1024

export function insertNodeAtCaret(editor: HTMLElement, node: Node) {
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
    range.setStartAfter(node)
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
