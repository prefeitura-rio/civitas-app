'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import {
  type ChangeEvent,
  type ClipboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import {
  getTicketComments,
  postTicketComment,
  type TicketCommentListItem,
} from '@/http/tickets/ticket-comentarios'
import { isApiError } from '@/lib/api'
import {
  toBrowserTicketReportHtml,
  toStoredTicketReportHtml,
} from '@/utils/ticket-report-images'

import styles from '../ticket-detail.module.css'
import {
  getTicketReportClipboardImages,
  getTicketReportImageValidationError,
  insertNodeAtCaret,
  insertTicketReportClipboardHtml,
  isHtmlEffectivelyEmpty,
  removeTicketReportImageLoaderState,
  RichToolbar,
  sanitizeTicketHtml,
  TICKET_REPORT_IMAGE_ACCEPT,
  useTicketReportImageLoaders,
} from './ticket-detail-rich-text'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'

type Props = {
  ticketId: string
}

function formatCommentDate(iso: string): string {
  try {
    const d = parseISO(iso)
    return `${format(d, 'yyyy-MM-dd')}   às   ${format(d, 'HH:mm')}`
  } catch {
    return '—'
  }
}

function badgeClassForPapel(papel: string): string {
  const p = papel.trim().toLowerCase()
  if (p.includes('agente')) return styles.parecerBadgeAgente
  if (p.includes('adjunto')) return styles.parecerBadgeAdjunto
  if (p.includes('administrativo')) return styles.parecerBadgeAdmin
  return styles.parecerBadgeDefault
}

function CommentBody({ body }: { body: string }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  useTicketReportImageLoaders(bodyRef, true)
  const html = useMemo(
    () => toBrowserTicketReportHtml(sanitizeTicketHtml(body)),
    [body],
  )

  if (isHtmlEffectivelyEmpty(html)) {
    return (
      <p className={`${styles.parecerBodyText} ${styles.parecerBodyMuted}`}>
        —
      </p>
    )
  }

  return (
    <div
      ref={bodyRef}
      className={styles.parecerBody}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export const TicketDetailTabParecerInterno = forwardRef<
  TicketDetailTabHandle,
  Props
>(function TicketDetailTabParecerInterno({ ticketId }, ref) {
  const queryClient = useQueryClient()
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingImagesByBlobUrl = useRef<Map<string, File>>(new Map())
  const [empty, setEmpty] = useState(true)
  useTicketReportImageLoaders(editorRef, true)
  const emptyRef = useRef(empty)

  emptyRef.current = empty

  const commentsQuery = useQuery({
    queryKey: ['ticket-comentarios', ticketId],
    queryFn: () => getTicketComments(ticketId),
  })

  const syncEmpty = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    setEmpty(isHtmlEffectivelyEmpty(el.innerHTML))
  }, [])

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    syncEmpty()
  }, [syncEmpty])

  const runCommand = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus()
      try {
        document.execCommand(command, false, value)
      } catch {
        /* ignore */
      }
      syncEmpty()
    },
    [syncEmpty],
  )

  const mutation = useMutation({
    mutationFn: ({ body, files }: { body: string; files: File[] }) =>
      postTicketComment(ticketId, { body: body.trim() }, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ticket-comentarios', ticketId],
      })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast.success('Comentário adicionado.')
      pendingImagesByBlobUrl.current.forEach((_, blobUrl) =>
        URL.revokeObjectURL(blobUrl),
      )
      pendingImagesByBlobUrl.current.clear()
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        setEmpty(true)
      }
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível enviar o comentário.',
      )
    },
  })

  const discardComposer = useCallback(() => {
    pendingImagesByBlobUrl.current.forEach((_, blobUrl) =>
      URL.revokeObjectURL(blobUrl),
    )
    pendingImagesByBlobUrl.current.clear()
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
      setEmpty(true)
    }
  }, [])

  const saveComposer = useCallback(async (): Promise<boolean> => {
    const el = editorRef.current
    if (!el) return false
    const clone = el.cloneNode(true) as HTMLElement
    removeTicketReportImageLoaderState(clone)
    const files: File[] = []
    let index = 0
    for (const image of clone.querySelectorAll('img')) {
      const source = image.getAttribute('src') || ''
      const file = pendingImagesByBlobUrl.current.get(source)
      if (!file) continue
      image.setAttribute('src', `__COMMENT_IMG_${index}__`)
      files.push(file)
      index += 1
    }
    const html = toStoredTicketReportHtml(sanitizeTicketHtml(clone.innerHTML))
    if (isHtmlEffectivelyEmpty(html)) {
      toast.error('Escreva um comentário antes de enviar.')
      return false
    }
    try {
      await mutation.mutateAsync({ body: html.trim(), files })
      return true
    } catch {
      return false
    }
  }, [mutation])

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => !emptyRef.current,
      save: saveComposer,
      discard: discardComposer,
    }),
    [discardComposer, saveComposer],
  )

  const handleSubmit = () => {
    saveComposer().catch(() => {})
  }

  const revokeOrphanPendingImages = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const used = new Set(
      Array.from(editor.querySelectorAll('img')).map(
        (image) => image.getAttribute('src') || '',
      ),
    )
    for (const blobUrl of pendingImagesByBlobUrl.current.keys()) {
      if (!used.has(blobUrl)) {
        URL.revokeObjectURL(blobUrl)
        pendingImagesByBlobUrl.current.delete(blobUrl)
      }
    }
  }, [])

  const insertImageFile = useCallback(
    (file: File) => {
      const validationError = getTicketReportImageValidationError(file)
      if (validationError) {
        toast.error(validationError)
        return
      }
      const editor = editorRef.current
      if (!editor) return
      const blobUrl = URL.createObjectURL(file)
      pendingImagesByBlobUrl.current.set(blobUrl, file)
      const image = document.createElement('img')
      image.alt = ''
      image.src = blobUrl
      insertNodeAtCaret(editor, image)
      syncEmpty()
      revokeOrphanPendingImages()
    },
    [revokeOrphanPendingImages, syncEmpty],
  )

  const handleImageFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (file) insertImageFile(file)
    },
    [insertImageFile],
  )

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      const editor = editorRef.current
      if (!editor) return
      try {
        if (
          insertTicketReportClipboardHtml(
            event.clipboardData.getData('text/html'),
            editor,
            pendingImagesByBlobUrl.current,
          )
        ) {
          event.preventDefault()
          syncEmpty()
          revokeOrphanPendingImages()
          return
        }
      } catch (error) {
        event.preventDefault()
        toast.error(
          error instanceof Error
            ? error.message
            : 'Não foi possível colar a imagem.',
        )
        return
      }
      const files = getTicketReportClipboardImages(event.clipboardData.items)
      if (files.length === 0) return
      event.preventDefault()
      files.forEach(insertImageFile)
    },
    [insertImageFile, revokeOrphanPendingImages, syncEmpty],
  )

  useEffect(
    () => () => {
      pendingImagesByBlobUrl.current.forEach((_, blobUrl) =>
        URL.revokeObjectURL(blobUrl),
      )
      pendingImagesByBlobUrl.current.clear()
    },
    [],
  )

  const items: TicketCommentListItem[] = commentsQuery.data ?? []

  return (
    <div className={styles.parecerRoot}>
      {commentsQuery.isLoading ? (
        <p className={styles.loading}>Carregando comentários…</p>
      ) : commentsQuery.isError ? (
        <p className={styles.error}>
          Não foi possível carregar os comentários internos.
        </p>
      ) : items.length === 0 ? (
        <p className={styles.parecerEmpty}>Nenhum comentário interno ainda.</p>
      ) : (
        <div className={styles.parecerList}>
          {items.map((c) => (
            <article key={c.id} className={styles.parecerItem}>
              <div className={styles.parecerHeader}>
                <span className={styles.parecerAuthor}>
                  {(c.author_name || '').trim() || '—'}
                </span>
                {c.author_roles.length > 0 ? (
                  <span
                    className={`${styles.parecerBadge} ${badgeClassForPapel(c.author_roles[0])}`}
                  >
                    {c.author_roles[0]}
                  </span>
                ) : null}
                <time className={styles.parecerDate} dateTime={c.created_at}>
                  {formatCommentDate(c.created_at)}
                </time>
              </div>
              <CommentBody body={c.body} />
            </article>
          ))}
        </div>
      )}

      <div className={styles.parecerComposer}>
        <div className={styles.parecerEditorShell}>
          <RichToolbar
            editorRef={editorRef}
            onCommand={runCommand}
            attachmentDisabled={mutation.isPending}
            onInsertImage={() => fileInputRef.current?.click()}
          />
          <div className={styles.parecerEditorArea}>
            {empty ? (
              <span className={styles.parecerPlaceholder} aria-hidden>
                Escreva um comentário
              </span>
            ) : null}
            <div
              ref={editorRef}
              role="textbox"
              aria-multiline
              aria-label="Comentário interno"
              contentEditable={!mutation.isPending}
              className={styles.parecerEditor}
              onInput={() => {
                syncEmpty()
                revokeOrphanPendingImages()
              }}
              onBlur={() => {
                syncEmpty()
                revokeOrphanPendingImages()
              }}
              onPaste={handlePaste}
              suppressContentEditableWarning
            />
          </div>
        </div>
        <button
          type="button"
          className={styles.parecerSubmit}
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Enviando…' : 'Adicionar Comentário'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={TICKET_REPORT_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleImageFile}
      />
    </div>
  )
})
