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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getOperations } from '@/http/operations/get-operations'
import {
  getTicketSolicitante,
  type TicketSolicitanteOut,
  type TicketSolicitanteUpsertIn,
  updateTicketSolicitante,
} from '@/http/tickets/ticket-solicitante'
import { isApiError } from '@/lib/api'
import { getApiErrorMessage } from '@/utils/error-handlers'
import { maskPhoneBR } from '@/utils/string-formatters'

import styles from '../ticket-detail.module.css'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'

type Props = {
  ticketId: string
}

function displayText(value?: string | null) {
  if (value == null) return '—'
  const t = value.trim()
  return t.length ? t : '—'
}

function mapOutToDraft(s: TicketSolicitanteOut): TicketSolicitanteUpsertIn {
  return {
    operation_id: s.operation_id,
    requester: {
      name: s.requester.name,
      phone: s.requester.phone ?? null,
      email: s.requester.email,
    },
    focal_points: s.focal_points.map((fp) => ({
      name: fp.name,
      phone: fp.phone?.trim() ? fp.phone : null,
      email: fp.email?.trim() ? fp.email : null,
    })),
  }
}

function emptyFocalRow(): TicketSolicitanteUpsertIn['focal_points'][number] {
  return { name: '', phone: null, email: null }
}

function buildSolicitantePayload(
  draft: TicketSolicitanteUpsertIn,
): TicketSolicitanteUpsertIn | null {
  const nomeReq = draft.requester.name.trim()
  const emailReq = draft.requester.email.trim()
  if (nomeReq.length < 2) {
    toast.error('Informe o nome do requisitante (mínimo 2 caracteres).')
    return null
  }
  if (!emailReq) {
    toast.error('Informe o e-mail do requisitante.')
    return null
  }
  if (!draft.operation_id?.trim()) {
    toast.error('Selecione o demandante.')
    return null
  }

  const pontos = draft.focal_points
    .map((fp) => ({
      name: fp.name.trim(),
      phone: fp.phone?.trim() ? fp.phone.trim() : null,
      email: fp.email?.trim() ? fp.email.trim() : null,
    }))
    .filter((fp) => fp.name.length >= 2)

  for (const fp of pontos) {
    if (fp.email != null && fp.email !== '') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fp.email)
      if (!ok) {
        toast.error('E-mail inválido em um dos pontos focais.')
        return null
      }
    }
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReq)
  if (!emailOk) {
    toast.error('E-mail do requisitante inválido.')
    return null
  }

  return {
    operation_id: draft.operation_id.trim(),
    requester: {
      name: nomeReq,
      phone: draft.requester.phone?.trim()
        ? draft.requester.phone.trim()
        : null,
      email: emailReq,
    },
    focal_points: pontos,
  }
}

export const TicketDetailTabSolicitante = forwardRef<
  TicketDetailTabHandle,
  Props
>(function TicketDetailTabSolicitante({ ticketId }, ref) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<TicketSolicitanteUpsertIn | null>(null)
  const isEditingRef = useRef(isEditing)
  const draftRef = useRef(draft)
  const solicitanteRef = useRef<TicketSolicitanteOut | undefined>(undefined)

  isEditingRef.current = isEditing
  draftRef.current = draft

  const solicitanteQuery = useQuery({
    queryKey: ['ticket', ticketId, 'solicitante'],
    queryFn: () => getTicketSolicitante(ticketId),
  })

  const operationsQuery = useQuery({
    queryKey: ['operations', 'select', 'solicitante-tab'],
    queryFn: () => getOperations({ page: 1, size: 100 }),
    enabled: isEditing,
  })

  const solicitante = solicitanteQuery.data
  solicitanteRef.current = solicitante

  useEffect(() => {
    if (!solicitante || isEditing) return
    setDraft(mapOutToDraft(solicitante))
  }, [solicitante, isEditing])

  const operationOptions = useMemo(() => {
    const items = operationsQuery.data?.data?.items ?? []
    const list = [...items]
    if (solicitante?.operation_id) {
      const exists = list.some((o) => o.id === solicitante.operation_id)
      if (!exists && solicitante.requester_operation) {
        list.unshift({
          id: solicitante.operation_id,
          title: solicitante.requester_operation,
          description: '',
        })
      }
    }
    return list
  }, [operationsQuery.data, solicitante])

  const updateMutation = useMutation({
    mutationFn: (payload: TicketSolicitanteUpsertIn) =>
      updateTicketSolicitante(ticketId, payload),
    onSuccess: () => {
      toast.success('Solicitante atualizado.')
      setIsEditing(false)
      queryClient
        .invalidateQueries({ queryKey: ['ticket', ticketId] })
        .catch(() => {})
      queryClient
        .invalidateQueries({
          queryKey: ['ticket', ticketId, 'solicitante'],
        })
        .catch(() => {})
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error))
    },
  })

  const beginEdit = useCallback(() => {
    if (!solicitante) return
    setDraft(mapOutToDraft(solicitante))
    setIsEditing(true)
  }, [solicitante])

  const cancelEdit = useCallback(() => {
    if (solicitante) setDraft(mapOutToDraft(solicitante))
    setIsEditing(false)
  }, [solicitante])

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const currentDraft = draftRef.current
    if (!currentDraft) return false
    const payload = buildSolicitantePayload(currentDraft)
    if (!payload) return false
    try {
      await updateMutation.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }, [updateMutation])

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => {
        if (
          !isEditingRef.current ||
          !draftRef.current ||
          !solicitanteRef.current
        ) {
          return false
        }
        const baseline = mapOutToDraft(solicitanteRef.current)
        return JSON.stringify(draftRef.current) !== JSON.stringify(baseline)
      },
      save: saveDraft,
      discard: cancelEdit,
    }),
    [cancelEdit, saveDraft],
  )

  const handleSave = useCallback(() => {
    saveDraft().catch(() => {})
  }, [saveDraft])

  const setRequisitante = useCallback(
    (patch: Partial<TicketSolicitanteUpsertIn['requester']>) => {
      setDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          requester: { ...prev.requester, ...patch },
        }
      })
    },
    [],
  )

  const setFocal = useCallback(
    (
      index: number,
      patch: Partial<TicketSolicitanteUpsertIn['focal_points'][number]>,
    ) => {
      setDraft((prev) => {
        if (!prev) return prev
        const next = [...prev.focal_points]
        next[index] = { ...next[index], ...patch }
        return { ...prev, focal_points: next }
      })
    },
    [],
  )

  const addFocal = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        focal_points: [...prev.focal_points, emptyFocalRow()],
      }
    })
  }, [])

  const removeFocal = useCallback((index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        focal_points: prev.focal_points.filter((_, i) => i !== index),
      }
    })
  }, [])

  if (solicitanteQuery.isLoading) {
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.loading}>Carregando solicitante…</p>
      </div>
    )
  }

  if (solicitanteQuery.isError || !solicitante) {
    const msg = isApiError(solicitanteQuery.error)
      ? getApiErrorMessage(solicitanteQuery.error)
      : 'Não foi possível carregar os dados do solicitante.'
    return (
      <div className={styles.panel} role="tabpanel">
        <p className={styles.error}>{msg}</p>
      </div>
    )
  }

  const view = solicitante
  const d = isEditing && draft ? draft : mapOutToDraft(view)

  return (
    <div className={styles.panel} role="tabpanel">
      <div className={styles.fieldStack}>
        <div className={styles.fieldBlock}>
          <span className={styles.fieldLabelUpper}>Demandante</span>
          {isEditing ? (
            <Select
              value={d.operation_id.trim() ? d.operation_id : undefined}
              onValueChange={(v) =>
                setDraft((prev) => (prev ? { ...prev, operation_id: v } : prev))
              }
              disabled={operationsQuery.isLoading}
            >
              <SelectTrigger
                className={`h-11 ${styles.detailSelectTrigger} ${styles.solicitanteEditSelectTrigger}`}
              >
                <SelectValue
                  placeholder={
                    operationsQuery.isLoading ? 'Carregando…' : 'Selecione'
                  }
                />
              </SelectTrigger>
              <SelectContent className={styles.detailSelectContent}>
                {operationsQuery.isLoading ? null : (
                  <>
                    {operationOptions.map((op) => (
                      <SelectItem
                        key={op.id}
                        value={op.id}
                        className={styles.detailSelectItem}
                      >
                        {op.title}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className={styles.readonlySelect}>
              <span className={styles.solicitanteReadOnlyText}>
                {displayText(view.requester_operation)}
              </span>
              <ChevronDown
                size={20}
                className={styles.readonlySelectMuted}
                aria-hidden
              />
            </div>
          )}
        </div>

        <div className={styles.fieldBlock}>
          <div>
            <p className={styles.sectionTitle} role="heading" aria-level={2}>
              Requisitante
            </p>
            <span className={styles.sectionHint}>
              Quem fez a solicitação oficialmente:
            </span>
          </div>
          <div className={styles.fieldStack}>
            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Nome</span>
                </div>
                {isEditing ? (
                  <input
                    className={`${styles.editableField} ${styles.solicitanteEditField}`}
                    value={d.requester.name}
                    onChange={(e) => setRequisitante({ name: e.target.value })}
                    autoComplete="name"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.requester.name)}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Contato</span>
                </div>
                {isEditing ? (
                  <input
                    className={`${styles.editableField} ${styles.solicitanteEditField}`}
                    value={d.requester.phone ?? ''}
                    onChange={(e) =>
                      setRequisitante({
                        phone: e.target.value || null,
                      })
                    }
                    autoComplete="tel"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.requester.phone)}
                  </div>
                )}
              </div>
              <div className={styles.fieldCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Email</span>
                </div>
                {isEditing ? (
                  <input
                    className={`${styles.editableField} ${styles.solicitanteEditField}`}
                    type="email"
                    value={d.requester.email}
                    onChange={(e) => setRequisitante({ email: e.target.value })}
                    autoComplete="email"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.requester.email)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.fieldBlock}>
          <div>
            <p className={styles.sectionTitle} role="heading" aria-level={2}>
              Ponto Focal
            </p>
            <span className={styles.sectionHint}>
              Quem vai receber as informações de resposta da demanda:
            </span>
          </div>
          <div className={styles.focalRows}>
            {!isEditing && view.focal_points.length === 0 ? (
              <div className={styles.fieldRow}>
                {(['Nome', 'Contato', 'Email'] as const).map((label) => (
                  <div key={label} className={styles.fieldCol}>
                    <div className={styles.subLabel}>
                      <span className={styles.subLabelText}>{label}</span>
                    </div>
                    <div
                      className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                    >
                      —
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!isEditing
              ? view.focal_points.map((fp, index) => (
                  <div key={`${fp.name}-${index}`} className={styles.fieldRow}>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Nome</span>
                      </div>
                      <div
                        className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                      >
                        {displayText(fp.name)}
                      </div>
                    </div>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Contato</span>
                      </div>
                      <div
                        className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                      >
                        {displayText(fp.phone)}
                      </div>
                    </div>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Email</span>
                      </div>
                      <div
                        className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                      >
                        {displayText(fp.email)}
                      </div>
                    </div>
                  </div>
                ))
              : d.focal_points.map((fp, index) => (
                  <div key={`fp-${index}`} className={styles.fieldStack}>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldCol}>
                        <div className={styles.subLabel}>
                          <span className={styles.subLabelText}>Nome</span>
                        </div>
                        <input
                          className={`${styles.editableField} ${styles.solicitanteEditField}`}
                          value={fp.name}
                          onChange={(e) =>
                            setFocal(index, { name: e.target.value })
                          }
                          autoComplete="name"
                        />
                      </div>
                      <div className={styles.fieldCol}>
                        <div className={styles.subLabel}>
                          <span className={styles.subLabelText}>Contato</span>
                        </div>
                        <input
                          className={`${styles.editableField} ${styles.solicitanteEditField}`}
                          inputMode="tel"
                          value={fp.phone ?? ''}
                          onChange={(e) =>
                            setFocal(index, {
                              phone: maskPhoneBR(e.target.value) || null,
                            })
                          }
                          autoComplete="tel"
                        />
                      </div>
                      <div className={styles.fieldCol}>
                        <div className={styles.subLabel}>
                          <span className={styles.subLabelText}>Email</span>
                        </div>
                        <input
                          className={`${styles.editableField} ${styles.solicitanteEditField}`}
                          type="email"
                          value={fp.email ?? ''}
                          onChange={(e) =>
                            setFocal(index, {
                              email: e.target.value || null,
                            })
                          }
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className={styles.focalRowActions}>
                      <button
                        type="button"
                        className={styles.removeFocalBtn}
                        onClick={() => removeFocal(index)}
                        disabled={updateMutation.isPending}
                      >
                        <Trash2 size={16} aria-hidden />
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
          </div>
          {isEditing ? (
            <div className={styles.focalFooter}>
              <button
                type="button"
                className={styles.addFocalBtn}
                onClick={addFocal}
                disabled={updateMutation.isPending}
              >
                <Plus size={20} aria-hidden />
                Adicionar Ponto Focal
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.footerActions}>
        {isEditing ? (
          <button
            type="button"
            className={`${styles.footerBtn} ${styles.footerBtnDefault}`}
            onClick={cancelEdit}
            disabled={updateMutation.isPending}
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
          disabled={!isEditing || updateMutation.isPending}
        >
          Salvar
        </button>
      </div>
    </div>
  )
})
