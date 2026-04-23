'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getOperations } from '@/http/operations/get-operations'
import {
  getTicketSolicitante,
  type TicketSolicitanteOut,
  type TicketSolicitanteUpsertIn,
  updateTicketSolicitante,
} from '@/http/tickets/ticket-solicitante'
import { isApiError } from '@/lib/api'
import { getApiErrorMessage } from '@/utils/error-handlers'

import styles from './ticket-detail.module.css'

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
    requisitante: {
      requisitante_nome: s.requisitante.requisitante_nome,
      requisitante_telefone: s.requisitante.requisitante_telefone ?? null,
      requisitante_email: s.requisitante.requisitante_email,
    },
    pontos_focais: s.pontos_focais.map((fp) => ({
      nome: fp.nome,
      telefone: fp.telefone?.trim() ? fp.telefone : null,
      email: fp.email?.trim() ? fp.email : null,
    })),
  }
}

function emptyFocalRow(): TicketSolicitanteUpsertIn['pontos_focais'][number] {
  return { nome: '', telefone: null, email: null }
}

export function TicketDetailTabSolicitante({ ticketId }: Props) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<TicketSolicitanteUpsertIn | null>(null)

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

  useEffect(() => {
    if (!solicitante || isEditing) return
    setDraft(mapOutToDraft(solicitante))
  }, [solicitante, isEditing])

  const operationOptions = useMemo(() => {
    const items = operationsQuery.data?.data?.items ?? []
    const list = [...items]
    if (solicitante?.operation_id) {
      const exists = list.some((o) => o.id === solicitante.operation_id)
      if (!exists && solicitante.demandante) {
        list.unshift({
          id: solicitante.operation_id,
          title: solicitante.demandante,
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

  const setRequisitante = useCallback(
    (patch: Partial<TicketSolicitanteUpsertIn['requisitante']>) => {
      setDraft((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          requisitante: { ...prev.requisitante, ...patch },
        }
      })
    },
    [],
  )

  const setFocal = useCallback(
    (
      index: number,
      patch: Partial<TicketSolicitanteUpsertIn['pontos_focais'][number]>,
    ) => {
      setDraft((prev) => {
        if (!prev) return prev
        const next = [...prev.pontos_focais]
        next[index] = { ...next[index], ...patch }
        return { ...prev, pontos_focais: next }
      })
    },
    [],
  )

  const addFocal = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pontos_focais: [...prev.pontos_focais, emptyFocalRow()],
      }
    })
  }, [])

  const removeFocal = useCallback((index: number) => {
    setDraft((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        pontos_focais: prev.pontos_focais.filter((_, i) => i !== index),
      }
    })
  }, [])

  const handleSave = useCallback(() => {
    if (!draft) return
    const nomeReq = draft.requisitante.requisitante_nome.trim()
    const emailReq = draft.requisitante.requisitante_email.trim()
    if (nomeReq.length < 2) {
      toast.error('Informe o nome do requisitante (mínimo 2 caracteres).')
      return
    }
    if (!emailReq) {
      toast.error('Informe o e-mail do requisitante.')
      return
    }
    if (!draft.operation_id?.trim()) {
      toast.error('Selecione o demandante.')
      return
    }

    const pontos = draft.pontos_focais
      .map((fp) => ({
        nome: fp.nome.trim(),
        telefone: fp.telefone?.trim() ? fp.telefone.trim() : null,
        email: fp.email?.trim() ? fp.email.trim() : null,
      }))
      .filter((fp) => fp.nome.length >= 2)

    for (const fp of pontos) {
      if (fp.email != null && fp.email !== '') {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fp.email)
        if (!ok) {
          toast.error('E-mail inválido em um dos pontos focais.')
          return
        }
      }
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailReq)
    if (!emailOk) {
      toast.error('E-mail do requisitante inválido.')
      return
    }

    const payload: TicketSolicitanteUpsertIn = {
      operation_id: draft.operation_id.trim(),
      requisitante: {
        requisitante_nome: nomeReq,
        requisitante_telefone: draft.requisitante.requisitante_telefone?.trim()
          ? draft.requisitante.requisitante_telefone.trim()
          : null,
        requisitante_email: emailReq,
      },
      pontos_focais: pontos,
    }

    updateMutation.mutate(payload)
  }, [draft, updateMutation])

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
            <select
              className={styles.editableSelect}
              value={d.operation_id}
              onChange={(e) =>
                setDraft((prev) =>
                  prev ? { ...prev, operation_id: e.target.value } : prev,
                )
              }
              disabled={operationsQuery.isLoading}
            >
              {operationsQuery.isLoading ? (
                <option value="">Carregando…</option>
              ) : (
                <>
                  <option value="">Selecione</option>
                  {operationOptions.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          ) : (
            <div className={styles.readonlySelect}>
              <span
                className={
                  view.demandante?.trim() ? '' : styles.readonlySelectMuted
                }
              >
                {displayText(view.demandante)}
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
                    className={styles.editableField}
                    value={d.requisitante.requisitante_nome}
                    onChange={(e) =>
                      setRequisitante({ requisitante_nome: e.target.value })
                    }
                    autoComplete="name"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${
                      view.requisitante.requisitante_nome
                        ? ''
                        : styles.readonlyInputMuted
                    }`}
                  >
                    {displayText(view.requisitante.requisitante_nome)}
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
                    className={styles.editableField}
                    value={d.requisitante.requisitante_telefone ?? ''}
                    onChange={(e) =>
                      setRequisitante({
                        requisitante_telefone: e.target.value || null,
                      })
                    }
                    autoComplete="tel"
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${
                      view.requisitante.requisitante_telefone
                        ? ''
                        : styles.readonlyInputMuted
                    }`}
                  >
                    {displayText(view.requisitante.requisitante_telefone)}
                  </div>
                )}
              </div>
              <div className={styles.fieldCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Email</span>
                </div>
                {isEditing ? (
                  <input
                    className={styles.editableField}
                    type="email"
                    value={d.requisitante.requisitante_email}
                    onChange={(e) =>
                      setRequisitante({ requisitante_email: e.target.value })
                    }
                    autoComplete="email"
                  />
                ) : (
                  <div className={styles.readonlyInput}>
                    {displayText(view.requisitante.requisitante_email)}
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
              Quem vai receber as informações de resposta do chamado:
            </span>
          </div>
          <div className={styles.focalRows}>
            {!isEditing && view.pontos_focais.length === 0 ? (
              <div className={styles.fieldRow}>
                {(['Nome', 'Contato', 'Email'] as const).map((label) => (
                  <div key={label} className={styles.fieldCol}>
                    <div className={styles.subLabel}>
                      <span className={styles.subLabelText}>{label}</span>
                    </div>
                    <div
                      className={`${styles.readonlyInput} ${styles.readonlyInputMuted}`}
                    >
                      —
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!isEditing
              ? view.pontos_focais.map((fp, index) => (
                  <div key={`${fp.nome}-${index}`} className={styles.fieldRow}>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Nome</span>
                      </div>
                      <div className={styles.readonlyInput}>
                        {displayText(fp.nome)}
                      </div>
                    </div>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Contato</span>
                      </div>
                      <div
                        className={`${styles.readonlyInput} ${
                          fp.telefone ? '' : styles.readonlyInputMuted
                        }`}
                      >
                        {displayText(fp.telefone)}
                      </div>
                    </div>
                    <div className={styles.fieldCol}>
                      <div className={styles.subLabel}>
                        <span className={styles.subLabelText}>Email</span>
                      </div>
                      <div
                        className={`${styles.readonlyInput} ${
                          fp.email ? '' : styles.readonlyInputMuted
                        }`}
                      >
                        {displayText(fp.email)}
                      </div>
                    </div>
                  </div>
                ))
              : d.pontos_focais.map((fp, index) => (
                  <div key={`fp-${index}`} className={styles.fieldStack}>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldCol}>
                        <div className={styles.subLabel}>
                          <span className={styles.subLabelText}>Nome</span>
                        </div>
                        <input
                          className={styles.editableField}
                          value={fp.nome}
                          onChange={(e) =>
                            setFocal(index, { nome: e.target.value })
                          }
                          autoComplete="name"
                        />
                      </div>
                      <div className={styles.fieldCol}>
                        <div className={styles.subLabel}>
                          <span className={styles.subLabelText}>Contato</span>
                        </div>
                        <input
                          className={styles.editableField}
                          value={fp.telefone ?? ''}
                          onChange={(e) =>
                            setFocal(index, {
                              telefone: e.target.value || null,
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
                          className={styles.editableField}
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
}
