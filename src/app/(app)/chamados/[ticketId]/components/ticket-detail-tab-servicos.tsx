'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { OpenServiceKey } from '@/app/(app)/chamados/criar/ticket-create/ticket-create.constant'
import { SERVICE_CONFIG } from '@/app/(app)/chamados/criar/ticket-create/ticket-create.constant'
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
import { isApiError } from '@/lib/api'

import styles from './ticket-detail.module.css'
import { TicketServicoAnexos } from './ticket-servico-anexos'
import {
  collectAllCompletedServiceErrors,
  completionErrorsForServiceRow,
} from './ticket-servicos-completion'
import { ServicosExpandedForm } from './ticket-servicos-expanded-form'
import {
  appendEmptyService,
  cloneTicketServicos,
  isLocalDraftServiceId,
  mergeServicosAnexosFromServer,
  removeServiceAt,
  setServiceConcluido,
  ticketServicosToReplacePayload,
} from './ticket-servicos-mapper'

const SERVICE_KINDS = [
  'busca_por_placa',
  'busca_por_radar',
  'cerco_eletronico',
  'busca_por_imagem',
  'placas_correlatas',
  'placas_conjuntas',
  'reserva_de_imagem',
  'analise_de_imagem',
  'outros',
] as const satisfies readonly OpenServiceKey[]

type TicketServiceRowKind = Exclude<OpenServiceKey, null>

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
  const list = (s[kind] ?? []) as { concluido?: boolean }[]
  return Boolean(list[index]?.concluido)
}

/** Erros de conclusão por `rowId`, só para linhas com `concluido` ativo. */
function computeCompletedServicoFieldErrors(
  draft: TicketServicosOut,
): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  SERVICE_KINDS.forEach((kind) => {
    const list = (draft[kind] ?? []) as {
      id: string
      concluido?: boolean
    }[]
    list.forEach((row, index) => {
      if (!row.concluido) return
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
}

export function TicketDetailTabServicos({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [addServicoOpen, setAddServicoOpen] = useState(false)

  const servicosQuery = useQuery({
    queryKey: ['ticket', ticketId, 'servicos'],
    queryFn: () => getTicketServicos(ticketId),
  })

  const [draft, setDraft] = useState<TicketServicosOut | null>(null)
  const [snapshot, setSnapshot] = useState<TicketServicosOut | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    mutationFn: (payload: ReturnType<typeof ticketServicosToReplacePayload>) =>
      replaceTicketServicos(ticketId, payload),
    onSuccess: (data) => {
      const c = cloneTicketServicos(data)
      setDraft(c)
      setSnapshot(cloneTicketServicos(data))
      setIsEditing(false)
      setExpandedId(null)
      queryClient.setQueryData(['ticket', ticketId, 'servicos'], data)
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      toast.success('Serviços salvos com sucesso.')
    },
    onError: (err: unknown) => {
      const msg = isApiError(err)
        ? (err.response?.data as { detail?: string } | undefined)?.detail
        : undefined
      toast.error(
        typeof msg === 'string' ? msg : 'Não foi possível salvar os serviços.',
      )
    },
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
    setIsEditing(true)
  }, [snapshot])

  const cancelEdit = useCallback(() => {
    if (snapshot) {
      setDraft(cloneTicketServicos(snapshot))
    }
    setIsEditing(false)
    setExpandedId(null)
  }, [snapshot])

  const handleConcluidoChange = useCallback(
    (row: RowMeta, checked: boolean) => {
      setDraft((prev) => {
        if (!prev) return prev
        return setServiceConcluido(prev, row.kind, row.index, checked)
      })
    },
    [],
  )

  const handleSave = useCallback(() => {
    if (!draft || !isEditing) return
    const invalid = collectAllCompletedServiceErrors(draft)
    if (invalid.length > 0) {
      toast.error(
        'Preencha todos os campos dos serviços marcados como concluídos.',
      )
      setExpandedId(invalid[0]?.rowId ?? null)
      return
    }
    replaceMutation.mutate(ticketServicosToReplacePayload(draft))
  }, [draft, isEditing, replaceMutation])

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
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.loading}>Carregando serviços…</p>
      </div>
    )
  }

  if (servicosQuery.isError) {
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.error}>
          Não foi possível carregar os serviços. Tente novamente.
        </p>
      </div>
    )
  }

  const formSource = isEditing ? draft : snapshot

  return (
    <div className={styles.panel} role="tabpanel">
      <div className={styles.fieldStack}>
        <div className={styles.servicosIntro}>
          <p className={styles.servicosSectionLabel}>
            Serviços prestados neste chamado
          </p>
        </div>

        {isEditing ? (
          <div className={styles.servicosAddServiceRow}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={styles.servicosPickServiceBtn}
              disabled={replaceMutation.isPending}
              onClick={() => setAddServicoOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Selecionar serviço
            </Button>
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
                        checked={readConcluido(formSource, row.kind, row.index)}
                        disabled={!isEditing || replaceMutation.isPending}
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
                      <span className={styles.servicosBarLabel}>
                        {row.title}
                      </span>
                      <ChevronDown
                        className={`${styles.servicosChevron} ${open ? styles.servicosChevronOpen : ''}`}
                      />
                    </button>
                  </div>

                  {open ? (
                    <div className={styles.servicosExpanded}>
                      <ServicosExpandedForm
                        kind={row.kind}
                        index={row.index}
                        draft={formSource}
                        onChange={isEditing ? setDraft : noopDraft}
                        readOnly={!isEditing}
                        fieldErrors={
                          isEditing
                            ? (serviceFieldErrors[row.rowId] ?? null)
                            : null
                        }
                      />
                      <TicketServicoAnexos
                        ticketId={ticketId}
                        title="Anexos deste serviço"
                        attachments={
                          (
                            formSource[row.kind]?.[row.index] as
                              | { anexos?: TicketAttachmentOut[] }
                              | undefined
                          )?.anexos ?? []
                        }
                        readOnly={!isEditing}
                        serviceScope={{
                          service_type: row.kind,
                          service_id: row.rowId,
                        }}
                        uploadBlocked={isLocalDraftServiceId(row.rowId)}
                      />
                      {isEditing ? (
                        <div className={styles.servicosRemoveRow}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={styles.servicosRemoveBtn}
                            onClick={() =>
                              handleRemoveRow(row.kind, row.index, row.rowId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                            Remover este serviço
                          </Button>
                        </div>
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
            disabled={replaceMutation.isPending}
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
          onClick={handleSave}
          disabled={!isEditing || replaceMutation.isPending}
        >
          {replaceMutation.isPending ? 'Salvando…' : 'Salvar'}
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
                Escolha o tipo de serviço a incluir neste chamado.
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
    </div>
  )
}
