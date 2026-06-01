'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

import type { OpenServiceKey } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import { SERVICE_CONFIG } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TicketAttachmentOut } from '@/http/tickets/ticket-attachments'
import {
  getTicketServicos,
  replaceTicketServicos,
  type TicketServicosOut,
} from '@/http/tickets/ticket-servicos'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from '../ticket-detail.module.css'
import {
  collectAllCompletedServiceErrors,
  completionErrorsForServiceRow,
} from '../ticket-servicos-completion'
import {
  appendEmptyService,
  cloneTicketServicos,
  mergeServicosAnexosFromServer,
  removeServiceAt,
  setServiceConcluido,
  ticketServicosToReplacePayload,
} from '../ticket-servicos-mapper'
import { buildTicketServicosSaveRequest } from '../ticket-servicos-save'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'
import {
  createPendingServiceAttachments,
  type PendingServiceAttachment,
} from './ticket-pending-attachment'
import { TicketServicoAnexos } from './ticket-servico-anexos'
import { ServicosExpandedForm } from './ticket-servicos-expanded-form'

const SERVICOS_SAVE_VIDEO_TOAST_ID = 'servicos-save-video-upload'

const SERVICE_KINDS = [
  'plate_search',
  'radar_search',
  'electronic_fence',
  'image_search',
  'correlated_plates',
  'joint_plates',
  'image_reservation',
  'image_analysis',
  'other',
  'atlas_civitas',
] as const satisfies readonly OpenServiceKey[]

type TicketServiceRowKind = Exclude<OpenServiceKey, null>

/** Serviços sem seção de attachments na aba Serviços do detalhe do ticket. */
const SERVICE_KINDS_WITHOUT_ATTACHMENTS = new Set<TicketServiceRowKind>([
  'electronic_fence',
  'atlas_civitas',
])

type RowMeta = {
  rowId: string
  kind: TicketServiceRowKind
  index: number
  title: string
}

function readConcluido(
  s: TicketServicosOut,
  kind: TicketServiceRowKind,
  index: number,
): boolean {
  const list = (s[kind] ?? []) as { completed?: boolean }[]
  return Boolean(list[index]?.completed)
}

/** Erros de conclusão por `rowId`, só para linhas com `completed` ativo. */
function computeCompletedServicoFieldErrors(
  draft: TicketServicosOut,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  SERVICE_KINDS.forEach((kind) => {
    const list = (draft[kind] ?? []) as {
      id: string
      completed?: boolean
    }[]
    list.forEach((row, index) => {
      if (!row.completed) return
      const errs = completionErrorsForServiceRow(draft, kind, index)
      if (Object.keys(errs).length > 0) {
        out[row.id] = errs
      }
    })
  })
  return out
}

function buildRows(s: TicketServicosOut): RowMeta[] {
  const out: RowMeta[] = []
  const titleFor = (base: string, index: number, total: number) =>
    total > 1 ? `${base} · ${index + 1}` : base

  SERVICE_KINDS.forEach((kind) => {
    const list = s[kind] ?? []
    const base = SERVICE_CONFIG[kind].label
    const n = list.length
    list.forEach((item, index) => {
      out.push({
        rowId: item.id,
        kind,
        index,
        title: titleFor(base, index, n),
      })
    })
  })
  return out
}

type Props = {
  ticketId: string
  /** Número interno do chamado — prefixo dos anexos em fila antes de salvar. */
  internalNumber?: string | number | null
}

type PendingServiceFilesByRowId = Record<string, PendingServiceAttachment[]>

export const TicketDetailTabServicos = forwardRef<TicketDetailTabHandle, Props>(
  function TicketDetailTabServicos({ ticketId, internalNumber }, ref) {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [addServicoOpen, setAddServicoOpen] = useState(false)
    const [pendingFilesByRowId, setPendingFilesByRowId] =
      useState<PendingServiceFilesByRowId>({})
    /** Cobre PUT + refetch + uploads de attachments pendentes (não só `replaceMutation.isPending`). */
    const [saveFlowPending, setSaveFlowPending] = useState(false)

    const servicosQuery = useQuery({
      queryKey: ['ticket', ticketId, 'services'],
      queryFn: () => getTicketServicos(ticketId),
    })

    const [draft, setDraft] = useState<TicketServicosOut | null>(null)
    const [snapshot, setSnapshot] = useState<TicketServicosOut | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const isEditingRef = useRef(isEditing)
    const draftRef = useRef(draft)
    const snapshotRef = useRef(snapshot)
    const pendingFilesRef = useRef(pendingFilesByRowId)

    isEditingRef.current = isEditing
    draftRef.current = draft
    snapshotRef.current = snapshot
    pendingFilesRef.current = pendingFilesByRowId

    useEffect(() => {
      if (!servicosQuery.data) return
      if (!isEditing) {
        const c = cloneTicketServicos(servicosQuery.data)
        setDraft(c)
        setSnapshot(cloneTicketServicos(servicosQuery.data))
        return
      }
      setDraft((prev) =>
        prev
          ? mergeServicosAnexosFromServer(prev, servicosQuery.data!)
          : cloneTicketServicos(servicosQuery.data),
      )
      setSnapshot((prev) =>
        prev
          ? mergeServicosAnexosFromServer(prev, servicosQuery.data!)
          : cloneTicketServicos(servicosQuery.data),
      )
    }, [servicosQuery.data, isEditing])

    const replaceMutation = useMutation({
      mutationFn: ({
        payload,
        files,
        attachmentMetadata,
      }: Awaited<ReturnType<typeof buildTicketServicosSaveRequest>>) =>
        replaceTicketServicos(ticketId, payload, files, attachmentMetadata),
    })

    const rows = useMemo(() => {
      if (!draft || !snapshot) return []
      return buildRows(isEditing ? draft : snapshot)
    }, [draft, snapshot, isEditing])

    const serviceFieldErrors = useMemo(() => {
      if (!isEditing || !draft) return {}
      return computeCompletedServicoFieldErrors(draft)
    }, [draft, isEditing])

    const beginEdit = useCallback(() => {
      if (!snapshot) return
      setDraft(cloneTicketServicos(snapshot))
      setPendingFilesByRowId({})
      setIsEditing(true)
    }, [snapshot])

    const cancelEdit = useCallback(() => {
      if (snapshot) {
        setDraft(cloneTicketServicos(snapshot))
      }
      setPendingFilesByRowId({})
      setIsEditing(false)
      setExpandedId(null)
    }, [snapshot])

    const queuePendingFiles = useCallback(
      (rowId: string, files: File[]) => {
        if (!files.length) return
        setPendingFilesByRowId((prev) => ({
          ...prev,
          [rowId]: [
            ...(prev[rowId] ?? []),
            ...createPendingServiceAttachments(files, internalNumber),
          ],
        }))
      },
      [internalNumber],
    )

    const renamePendingFile = useCallback(
      (rowId: string, index: number, filename: string) => {
        setPendingFilesByRowId((prev) => {
          const rowFiles = prev[rowId] ?? []
          const item = rowFiles[index]
          if (!item) return prev
          const nextRowFiles = rowFiles.map((entry, i) =>
            i === index ? { ...entry, filename } : entry,
          )
          return { ...prev, [rowId]: nextRowFiles }
        })
      },
      [],
    )

    const removePendingFile = useCallback((rowId: string, index: number) => {
      setPendingFilesByRowId((prev) => {
        const rowFiles = prev[rowId] ?? []
        if (!rowFiles[index]) return prev
        const nextRowFiles = rowFiles.filter((_, i) => i !== index)
        if (nextRowFiles.length === 0) {
          const next = { ...prev }
          delete next[rowId]
          return next
        }
        return {
          ...prev,
          [rowId]: nextRowFiles,
        }
      })
    }, [])

    const handleConcluidoChange = useCallback(
      (row: RowMeta, checked: boolean) => {
        setDraft((prev) => {
          if (!prev) return prev
          return setServiceConcluido(prev, row.kind, row.index, checked)
        })
      },
      [],
    )

    const handleSave = useCallback(async (): Promise<boolean> => {
      const currentDraft = draftRef.current
      if (!currentDraft || !isEditingRef.current) return false
      const invalid = collectAllCompletedServiceErrors(currentDraft)
      if (invalid.length > 0) {
        toast.error(
          'Preencha todos os campos dos serviços marcados como concluídos.',
        )
        setExpandedId(invalid[0]?.rowId ?? null)
        return false
      }

      setSaveFlowPending(true)
      try {
        const currentPending = pendingFilesRef.current
        let saveRequest: Awaited<
          ReturnType<typeof buildTicketServicosSaveRequest>
        >

        try {
          saveRequest = await buildTicketServicosSaveRequest(
            ticketId,
            currentDraft,
            currentPending,
            {
              onGcsProgress: ({ fileName, uploadKind, phase, percent }) => {
                if (phase === 'preparing') {
                  toast.loading(`A enviar ${uploadKind}: ${fileName} — 0%`, {
                    id: SERVICOS_SAVE_VIDEO_TOAST_ID,
                    duration: Infinity,
                  })
                  return
                }
                if (phase === 'uploading') {
                  toast.loading(
                    `A enviar ${uploadKind}: ${fileName} — ${percent}%`,
                    {
                      id: SERVICOS_SAVE_VIDEO_TOAST_ID,
                      duration: Infinity,
                    },
                  )
                  return
                }
                toast.loading(`A finalizar: ${fileName}…`, {
                  id: SERVICOS_SAVE_VIDEO_TOAST_ID,
                  duration: Infinity,
                })
              },
            },
          )
        } catch {
          toast.error(
            'Não foi possível enviar um ou mais vídeos/ZIP. Tente novamente.',
          )
          return false
        } finally {
          toast.dismiss(SERVICOS_SAVE_VIDEO_TOAST_ID)
        }

        let saved: TicketServicosOut
        try {
          saved = await replaceMutation.mutateAsync(saveRequest)
        } catch (err: unknown) {
          toast.error(getApiErrorMessage(err))
          return false
        }

        const c = cloneTicketServicos(saved)
        setDraft(c)
        setSnapshot(cloneTicketServicos(saved))
        setPendingFilesByRowId({})
        setIsEditing(false)
        setExpandedId(null)
        queryClient.setQueryData(['ticket', ticketId, 'services'], saved)
        queryClient.invalidateQueries({
          queryKey: ['ticket', ticketId, 'services'],
        })
        queryClient.invalidateQueries({
          queryKey: ['ticket-attachments', ticketId],
        })
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })

        toast.success('Serviços e attachments salvos com sucesso.')
        return true
      } catch {
        toast.error('Ocorreu um erro ao salvar os serviços.')
        return false
      } finally {
        setSaveFlowPending(false)
      }
    }, [queryClient, replaceMutation, ticketId])

    useImperativeHandle(
      ref,
      () => ({
        isDirty: () => {
          if (
            !isEditingRef.current ||
            !draftRef.current ||
            !snapshotRef.current
          ) {
            return false
          }
          const hasPendingFiles =
            Object.keys(pendingFilesRef.current).length > 0
          const draftPayload = ticketServicosToReplacePayload(draftRef.current)
          const snapshotPayload = ticketServicosToReplacePayload(
            snapshotRef.current,
          )
          const payloadChanged =
            JSON.stringify(draftPayload) !== JSON.stringify(snapshotPayload)
          return payloadChanged || hasPendingFiles
        },
        save: handleSave,
        discard: cancelEdit,
      }),
      [cancelEdit, handleSave],
    )

    const triggerSave = useCallback(() => {
      handleSave().catch(() => {})
    }, [handleSave])

    const saveOrUploadBusy = saveFlowPending || replaceMutation.isPending

    const handleAddKind = (kind: (typeof SERVICE_KINDS)[number]) => {
      setDraft((prev) => {
        if (!prev) return prev
        const next = appendEmptyService(prev, kind)
        const list = next[kind as keyof TicketServicosOut] as { id: string }[]
        const newItem = list[list.length - 1]
        if (newItem) {
          setExpandedId(newItem.id)
        }
        return next
      })
      setAddServicoOpen(false)
    }

    const handleRemoveRow = (
      kind: OpenServiceKey,
      index: number,
      rowId: string,
    ) => {
      setDraft((prev) => {
        if (!prev) return prev
        return removeServiceAt(prev, kind, index)
      })
      setPendingFilesByRowId((prev) => {
        if (!(rowId in prev)) return prev
        const next = { ...prev }
        delete next[rowId]
        return next
      })
      if (expandedId === rowId) {
        setExpandedId(null)
      }
    }

    const noopDraft = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- modo leitura: alterações ignoradas
      (_next: TicketServicosOut) => {},
      [],
    )

    if (servicosQuery.isLoading || !draft || !snapshot) {
      return <p className={styles.loading}>Carregando serviços…</p>
    }

    if (servicosQuery.isError) {
      return (
        <p className={styles.error}>
          Não foi possível carregar os serviços. Tente novamente.
        </p>
      )
    }

    const formSource = isEditing ? draft : snapshot

    return (
      <>
        <div className={styles.fieldStack}>
          <div className={styles.servicosIntro}>
            <p className={styles.servicosSectionLabel}>
              Serviços prestados nesta demanda
            </p>
          </div>

          {isEditing ? (
            <div className={styles.servicosAddServiceRow}>
              <button
                type="button"
                className={`${styles.footerBtn} ${styles.servicosAddExistingBtn}`}
                onClick={() => setAddServicoOpen(true)}
                disabled={saveOrUploadBusy}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Novo Serviço
              </button>
            </div>
          ) : null}

          {rows.length === 0 ? (
            <p className={styles.servicosEmpty}>
              {isEditing
                ? 'Nenhum serviço cadastrado. Use “Selecionar serviço” para adicionar.'
                : 'Nenhum serviço cadastrado. Clique em “Editar” para incluir serviços.'}
            </p>
          ) : (
            <div className={styles.servicosList}>
              {rows.map((row) => {
                const open = expandedId === row.rowId
                return (
                  <div key={row.rowId} className={styles.servicosItem}>
                    <div className={styles.servicosCollapsedRow}>
                      <span
                        className={styles.servicosMark}
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={readConcluido(
                            formSource,
                            row.kind,
                            row.index,
                          )}
                          disabled={!isEditing || saveOrUploadBusy}
                          onCheckedChange={(v) =>
                            handleConcluidoChange(row, v === true)
                          }
                          aria-label="Serviço concluído"
                          className="border-[var(--td-border)] data-[state=checked]:bg-[var(--td-btn-primary)]"
                        />
                      </span>
                      <button
                        type="button"
                        className={styles.servicosBar}
                        aria-expanded={open}
                        onClick={() =>
                          setExpandedId((prev) =>
                            prev === row.rowId ? null : row.rowId,
                          )
                        }
                      >
                        <span
                          className={`${styles.servicosBarLabel} ${
                            isEditing ? styles.servicosBarLabelEditing : ''
                          }`}
                        >
                          {row.title}
                        </span>
                        <ChevronDown
                          className={`${styles.servicosChevron} ${open ? styles.servicosChevronOpen : ''}`}
                        />
                      </button>
                      {isEditing ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={styles.servicosRemoveInlineBtn}
                          disabled={saveOrUploadBusy}
                          onClick={() =>
                            handleRemoveRow(row.kind, row.index, row.rowId)
                          }
                          title="Remover este serviço"
                          aria-label="Remover este serviço"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    {open ? (
                      <div className={styles.servicosExpanded}>
                        <ServicosExpandedForm
                          kind={row.kind}
                          index={row.index}
                          draft={formSource}
                          onChange={
                            isEditing && !saveOrUploadBusy
                              ? setDraft
                              : noopDraft
                          }
                          readOnly={!isEditing || saveOrUploadBusy}
                          fieldErrors={
                            isEditing
                              ? (serviceFieldErrors[row.rowId] ?? null)
                              : null
                          }
                        />
                        {!SERVICE_KINDS_WITHOUT_ATTACHMENTS.has(row.kind) ? (
                          <TicketServicoAnexos
                            ticketId={ticketId}
                            title="Anexos deste serviço"
                            attachments={
                              (
                                formSource[row.kind]?.[row.index] as
                                  | { attachments?: TicketAttachmentOut[] }
                                  | undefined
                              )?.attachments ?? []
                            }
                            readOnly={!isEditing || saveOrUploadBusy}
                            serviceScope={{
                              service_type: row.kind,
                              service_id: row.rowId,
                            }}
                            uploadBlocked={isEditing}
                            uploadBlockedMessage="Os attachments serão enviados ao salvar as alterações dos serviços."
                            pendingFiles={pendingFilesByRowId[row.rowId] ?? []}
                            onQueuePendingFiles={(files) =>
                              queuePendingFiles(row.rowId, files)
                            }
                            onRenamePendingFile={(index, filename) =>
                              renamePendingFile(row.rowId, index, filename)
                            }
                            onRemovePendingFile={(index) =>
                              removePendingFile(row.rowId, index)
                            }
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.footerActions}>
          {isEditing ? (
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
              onClick={cancelEdit}
              disabled={saveOrUploadBusy}
            >
              Cancelar
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
              onClick={beginEdit}
            >
              Editar
            </button>
          )}
          <button
            type="button"
            className={`${styles.footerBtn} ${styles.footerBtnPrimary}`}
            onClick={triggerSave}
            disabled={!isEditing || saveOrUploadBusy}
          >
            {saveOrUploadBusy ? 'Salvando…' : 'Salvar'}
          </button>
        </div>

        <Dialog open={addServicoOpen} onOpenChange={setAddServicoOpen}>
          <DialogContent className={styles.servicosDialogContent}>
            <div className={styles.servicosDialogInner}>
              <DialogHeader className={styles.servicosDialogHeader}>
                <DialogTitle className={styles.servicosDialogTitle}>
                  Selecionar serviço
                </DialogTitle>
                <DialogDescription className={styles.servicosDialogDesc}>
                  Escolha o tipo de serviço a incluir nesta demanda.
                </DialogDescription>
              </DialogHeader>
              <ul className={styles.servicosDialogList}>
                {SERVICE_KINDS.map((k) => (
                  <li key={k}>
                    <button
                      type="button"
                      className={styles.servicosDialogOption}
                      onClick={() => handleAddKind(k)}
                    >
                      {SERVICE_CONFIG[k].label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  },
)
