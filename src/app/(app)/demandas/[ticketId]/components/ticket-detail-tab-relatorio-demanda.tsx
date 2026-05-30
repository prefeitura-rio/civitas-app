'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  type ChangeEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import {
  getTicketRelatorioDemanda,
  putTicketRelatorioDemanda,
} from '@/http/tickets/ticket-relatorio-demanda'
import { isApiError } from '@/lib/api'

import styles from '../ticket-detail.module.css'
import {
  isHtmlEffectivelyEmpty,
  RichToolbar,
  sanitizeTicketHtml,
} from './ticket-detail-rich-text'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/gif,image/webp'
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const REPORT_QUERY_KEY = (ticketId: string) =>
  ['ticket', ticketId, 'relatorio-demanda'] as const

type Props = {
  ticketId: string
}

function insertNodeAtCaret(editor: HTMLElement, node: Node) {
  editor.focus()
  const sel = window.getSelection()
  if (
    sel &&
    sel.rangeCount > 0 &&
    sel.anchorNode &&
    editor.contains(sel.anchorNode)
  ) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  } else {
    editor.appendChild(node)
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    sel?.removeAllRanges()
    sel?.addRange(range)
  }
}

export const TicketDetailTabRelatorioDemanda = forwardRef<
  TicketDetailTabHandle,
  Props
>(function TicketDetailTabRelatorioDemanda({ ticketId }, ref) {
  const queryClient = useQueryClient()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingByBlobRef = useRef<Map<string, File>>(new Map())
  const [empty, setEmpty] = useState(true)
  const [dirty, setDirty] = useState(false)
  const dirtyRef = useRef(dirty)
  const reportDataRef = useRef<
    Awaited<ReturnType<typeof getTicketRelatorioDemanda>> | undefined
  >(undefined)

  dirtyRef.current = dirty

  const reportQuery = useQuery({
    queryKey: REPORT_QUERY_KEY(ticketId),
    queryFn: () => getTicketRelatorioDemanda(ticketId),
  })

  reportDataRef.current = reportQuery.data

  const syncEmpty = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    setEmpty(isHtmlEffectivelyEmpty(el.innerHTML))
  }, [])

  const revokeOrphanBlobs = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const used = new Set(
      Array.from(el.querySelectorAll('img')).map(
        (img) => img.getAttribute('src') || '',
      ),
    )
    for (const url of [...pendingByBlobRef.current.keys()]) {
      if (!used.has(url)) {
        URL.revokeObjectURL(url)
        pendingByBlobRef.current.delete(url)
      }
    }
  }, [])

  const resetEditorFromServer = useCallback(() => {
    pendingByBlobRef.current.forEach((_, url) => URL.revokeObjectURL(url))
    pendingByBlobRef.current.clear()
    const html =
      reportDataRef.current?.html_content != null
        ? reportDataRef.current.html_content
        : ''
    if (editorRef.current) {
      editorRef.current.innerHTML = sanitizeTicketHtml(html)
      syncEmpty()
    }
    setDirty(false)
  }, [syncEmpty])

  useEffect(() => {
    if (reportQuery.isLoading || !editorRef.current) return
    if (reportQuery.isError) return
    if (dirty) return

    const html =
      reportQuery.data?.html_content != null
        ? reportQuery.data.html_content
        : ''
    editorRef.current.innerHTML = sanitizeTicketHtml(html)
    syncEmpty()
  }, [
    reportQuery.isLoading,
    reportQuery.isError,
    reportQuery.data?.html_content,
    reportQuery.data?.updated_at,
    dirty,
    syncEmpty,
  ])

  useEffect(() => {
    setDirty(false)
    return () => {
      pendingByBlobRef.current.forEach((_, url) => URL.revokeObjectURL(url))
      pendingByBlobRef.current.clear()
    }
  }, [ticketId])

  const runCommand = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus()
      try {
        document.execCommand(command, false, value)
      } catch {
        /* ignore */
      }
      syncEmpty()
      setDirty(true)
    },
    [syncEmpty],
  )

  const buildSaveBody = useCallback(() => {
    const el = editorRef.current
    if (!el) return null

    const clone = el.cloneNode(true) as HTMLElement
    const files: File[] = []
    let i = 0
    for (const img of clone.querySelectorAll('img')) {
      const src = img.getAttribute('src') || ''
      const file = pendingByBlobRef.current.get(src)
      if (file) {
        img.setAttribute('src', `__DEMAND_IMG_${i}__`)
        files.push(file)
        i += 1
      }
    }

    const conteudoHtml = sanitizeTicketHtml(clone.innerHTML)
    return { html_content: conteudoHtml, files }
  }, [])

  const saveMutation = useMutation({
    mutationFn: () => {
      const body = buildSaveBody()
      if (!body) throw new Error('Editor indisponível.')
      return putTicketRelatorioDemanda(
        ticketId,
        { html_content: body.html_content },
        body.files,
      )
    },
    onSuccess: (data) => {
      pendingByBlobRef.current.forEach((_, url) => URL.revokeObjectURL(url))
      pendingByBlobRef.current.clear()
      queryClient.setQueryData(REPORT_QUERY_KEY(ticketId), data)
      if (editorRef.current) {
        editorRef.current.innerHTML = sanitizeTicketHtml(
          data.html_content || '',
        )
        syncEmpty()
      }
      setDirty(false)
      toast.success('Relatório de demanda gravado.')
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível gravar o relatório.',
      )
    },
  })

  const saveReport = useCallback(async (): Promise<boolean> => {
    const body = buildSaveBody()
    if (!body) return false
    if (isHtmlEffectivelyEmpty(body.html_content) && body.files.length === 0) {
      toast.error('Escreva o relatório ou insira uma imagem antes de gravar.')
      return false
    }
    try {
      await saveMutation.mutateAsync()
      return true
    } catch {
      return false
    }
  }, [buildSaveBody, saveMutation])

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => dirtyRef.current,
      save: saveReport,
      discard: resetEditorFromServer,
    }),
    [resetEditorFromServer, saveReport],
  )

  const openImagePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onImageFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
        toast.error('Use JPEG, PNG, GIF ou WebP.')
        return
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error('Cada imagem pode ter no máximo 10 MB.')
        return
      }

      const editor = editorRef.current
      if (!editor) return

      const blobUrl = URL.createObjectURL(file)
      pendingByBlobRef.current.set(blobUrl, file)

      const img = document.createElement('img')
      img.alt = ''
      img.src = blobUrl

      insertNodeAtCaret(editor, img)
      syncEmpty()
      setDirty(true)
      revokeOrphanBlobs()
    },
    [revokeOrphanBlobs, syncEmpty],
  )

  const handleSave = () => {
    saveReport().catch(() => {})
  }

  if (reportQuery.isLoading) {
    return <p className={styles.loading}>Carregando relatório…</p>
  }

  if (reportQuery.isError) {
    return (
      <p className={styles.error}>
        Não foi possível carregar o relatório de demanda.
      </p>
    )
  }

  return (
    <div className={styles.relatorioRoot}>
      <div className={styles.relatorioCardWrap}>
        <div className={styles.parecerEditorShell}>
          <RichToolbar
            editorRef={editorRef}
            onCommand={runCommand}
            attachmentDisabled={saveMutation.isPending}
            onInsertImage={openImagePicker}
          />
          <div className={styles.parecerEditorArea}>
            {empty ? (
              <span className={styles.parecerPlaceholder} aria-hidden>
                Descreva o relatório de demanda…
              </span>
            ) : null}
            <div
              ref={editorRef}
              role="textbox"
              aria-multiline
              aria-label="Relatório de demanda"
              contentEditable={!saveMutation.isPending}
              className={`${styles.parecerEditor} ${styles.relatorioEditor}`}
              onInput={() => {
                syncEmpty()
                setDirty(true)
                revokeOrphanBlobs()
              }}
              onBlur={() => {
                syncEmpty()
                revokeOrphanBlobs()
              }}
              suppressContentEditableWarning
            />
          </div>
        </div>
      </div>

      <div className={styles.relatorioActions}>
        <button
          type="button"
          className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Gravando…' : 'Gravar relatório'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onImageFile}
      />
    </div>
  )
})
