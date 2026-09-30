'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import {
  type ChangeEvent,
  type ClipboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import { Tooltip } from '@/components/custom/tooltip'
import {
  getTicketRelatorioDemanda,
  putTicketRelatorioDemanda,
} from '@/http/tickets/ticket-relatorio-demanda'
import { isApiError } from '@/lib/api'
import { toBrowserTicketReportHtml } from '@/utils/ticket-report-images'

import styles from '../ticket-detail.module.css'
import {
  buildTicketReportUpload,
  getTicketReportClipboardImages,
  getTicketReportImageValidationError,
  insertNodeAtCaret,
  insertTicketReportClipboardHtml,
  isHtmlEffectivelyEmpty,
  releaseTicketReportImages,
  RichToolbar,
  sanitizeTicketHtml,
  TICKET_REPORT_IMAGE_ACCEPT,
  useTicketReportImageLoaders,
} from './ticket-detail-rich-text'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'

const REPORT_QUERY_KEY = (ticketId: string) =>
  ['ticket', ticketId, 'relatorio-demanda'] as const

const RELATORIO_PASTE_TOOLTIP =
  'Cole o texto sem formatação. Para evitar importar tags HTML ou estilos indesejados, copie o conteúdo primeiro para o Bloco de Notas e depois cole na plataforma. Revise o texto antes de salvar.'

type Props = {
  ticketId: string
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
  useTicketReportImageLoaders(
    editorRef,
    !reportQuery.isLoading && !reportQuery.isError,
  )

  reportDataRef.current = reportQuery.data

  const syncEmpty = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    setEmpty(isHtmlEffectivelyEmpty(el.innerHTML))
  }, [])

  const revokeOrphanBlobs = useCallback(() => {
    const editor = editorRef.current
    if (editor) releaseTicketReportImages(pendingByBlobRef.current, editor)
  }, [])

  const resetEditorFromServer = useCallback(() => {
    releaseTicketReportImages(pendingByBlobRef.current)
    const html =
      reportDataRef.current?.html_content != null
        ? reportDataRef.current.html_content
        : ''
    if (editorRef.current) {
      editorRef.current.innerHTML = toBrowserTicketReportHtml(
        sanitizeTicketHtml(html),
      )
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
    editorRef.current.innerHTML = toBrowserTicketReportHtml(
      sanitizeTicketHtml(html),
    )
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
      releaseTicketReportImages(pendingByBlobRef.current)
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

    return buildTicketReportUpload(el, pendingByBlobRef.current, 'demand')
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
      releaseTicketReportImages(pendingByBlobRef.current)
      queryClient.setQueryData(REPORT_QUERY_KEY(ticketId), data)
      if (editorRef.current) {
        editorRef.current.innerHTML = toBrowserTicketReportHtml(
          sanitizeTicketHtml(data.html_content || ''),
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

  const onImageFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (file) insertImageFile(file)
    },
    [insertImageFile],
  )

  const onPaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      const editor = editorRef.current
      if (!editor) return
      try {
        if (
          insertTicketReportClipboardHtml(
            event.clipboardData.getData('text/html'),
            editor,
            pendingByBlobRef.current,
          )
        ) {
          event.preventDefault()
          syncEmpty()
          setDirty(true)
          revokeOrphanBlobs()
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
    [insertImageFile, revokeOrphanBlobs, syncEmpty],
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
          <div className={styles.relatorioEditorToolbarRow}>
            <RichToolbar
              editorRef={editorRef}
              onCommand={runCommand}
              attachmentDisabled={saveMutation.isPending}
              onInsertImage={openImagePicker}
            />
            <Tooltip asChild text={RELATORIO_PASTE_TOOLTIP} side="bottom">
              <span
                className={`${styles.parecerToolbarBtn} ${styles.relatorioPasteTooltipTrigger}`}
                aria-label={RELATORIO_PASTE_TOOLTIP}
              >
                <Info size={16} strokeWidth={2.25} aria-hidden />
              </span>
            </Tooltip>
          </div>
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
              onPaste={onPaste}
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
        accept={TICKET_REPORT_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onImageFile}
      />
    </div>
  )
})
