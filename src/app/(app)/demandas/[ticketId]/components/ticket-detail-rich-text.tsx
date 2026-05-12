'use client'

import { Bold, Italic, Link2, Paperclip, Underline } from 'lucide-react'
import { type MouseEvent, type RefObject, useEffect, useState } from 'react'

import styles from '../ticket-detail.module.css'

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

export function sanitizeTicketHtml(html: string): string {
  if (typeof window === 'undefined') return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll('script, iframe, object, embed').forEach((el) => {
    el.remove()
  })
  doc.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name)
      }
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
