'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  getTicketComments,
  postTicketComment,
  type TicketCommentListItem,
} from '@/http/tickets/ticket-comentarios'
import { isApiError } from '@/lib/api'

import styles from '../ticket-detail.module.css'
import {
  isHtmlEffectivelyEmpty,
  RichToolbar,
  sanitizeTicketHtml,
} from './ticket-detail-rich-text'

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
  if (p.includes('operador')) return styles.parecerBadgeOperador
  if (p.includes('adjunto')) return styles.parecerBadgeAdjunto
  if (p.includes('administrativo')) return styles.parecerBadgeAdmin
  return styles.parecerBadgeDefault
}

function CommentBody({ corpo }: { corpo: string }) {
  const html = useMemo(() => sanitizeTicketHtml(corpo), [corpo])
  const plain = useMemo(() => {
    if (typeof window === 'undefined') return corpo
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return (doc.body.textContent || '').trim()
  }, [html])

  if (!plain) {
    return (
      <p className={`${styles.parecerBodyText} ${styles.parecerBodyMuted}`}>
        —
      </p>
    )
  }

  return (
    <div
      className={styles.parecerBody}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export function TicketDetailTabParecerInterno({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const editorRef = useRef<HTMLDivElement>(null)
  const [empty, setEmpty] = useState(true)

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
    mutationFn: (corpo: string) =>
      postTicketComment(ticketId, { corpo: corpo.trim() }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ticket-comentarios', ticketId],
      })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast.success('Comentário adicionado.')
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

  const handleSubmit = () => {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    if (isHtmlEffectivelyEmpty(html)) {
      toast.error('Escreva um comentário antes de enviar.')
      return
    }
    mutation.mutate(html.trim())
  }

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
                  {(c.autor_nome || '').trim() || '—'}
                </span>
                {c.autor_papeis.length > 0 ? (
                  <span
                    className={`${styles.parecerBadge} ${badgeClassForPapel(c.autor_papeis[0])}`}
                  >
                    {c.autor_papeis[0]}
                  </span>
                ) : null}
                <time className={styles.parecerDate} dateTime={c.criado_em}>
                  {formatCommentDate(c.criado_em)}
                </time>
              </div>
              <CommentBody corpo={c.corpo} />
            </article>
          ))}
        </div>
      )}

      <div className={styles.parecerComposer}>
        <div className={styles.parecerEditorShell}>
          <RichToolbar editorRef={editorRef} onCommand={runCommand} />
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
              onInput={syncEmpty}
              onBlur={syncEmpty}
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
    </div>
  )
}
