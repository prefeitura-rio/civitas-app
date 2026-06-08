'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Tag } from 'lucide-react'
import Link from 'next/link'
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

import { TICKET_CREATE_STRING_LIMITS as CREATE_STR_LIMITS } from '@/app/(app)/demandas/criar/ticket-create/ticket-create.constant'
import { formatTicketStatusLabel } from '@/app/(app)/demandas/dashboard-tatico/utils/ticket-status'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTicketNatures } from '@/http/get-ticket-natures/get-ticket-natures'
import {
  getTicketTypes,
  type TicketType,
} from '@/http/ticket-types/get-ticket.types'
import {
  getTicketFicha,
  type TicketFichaOut,
  type TicketFichaUpdateIn,
  updateTicketFicha,
} from '@/http/tickets/ticket-ficha'
import { isApiError } from '@/lib/api'
import { getApiErrorMessage } from '@/utils/error-handlers'
import {
  maskNumeroOficio,
  normalizeNumeroOficio,
} from '@/utils/string-formatters'

import { shouldShowTicketSeiFields } from '../ticket-detail.constants'
import styles from '../ticket-detail.module.css'
import type { TicketDetailTabHandle } from './ticket-detail-tab-handle'

const MAX_OFICIO_PROC = 60
const MAX_APELIDO = 120
const MAX_NUMERO_SEI = 60
const MAX_LINK_SEI = 2048

const SERVICE_PREVIEW = 3

type Props = {
  ticketId: string
  ticketStateId?: string | null
  ticketStatus?: string | null
}

function displayText(value?: string | null) {
  if (value == null) return '—'
  const t = value.trim()
  return t.length ? t : '—'
}

function formatNumeroInterno(n?: number | null) {
  if (n == null) return '—'
  return String(n).padStart(7, '0')
}

function rtTagClass(label: string) {
  const n = label.trim().toLowerCase()
  if (n.includes('cerco')) return styles.rtTagPink
  if (n.includes('busca por placa') || n.includes('busca de placa'))
    return styles.rtTagGreen
  if (n.includes('reserva de imagem')) return styles.rtTagYellow
  if (n.includes('busca por imagem') || n.includes('busca de imagem'))
    return styles.rtTagCyan
  if (n.includes('busca por radar') || n.includes('busca de radar'))
    return styles.rtTagBlue
  if (n.includes('placas correlatas')) return styles.rtTagOrange
  if (n.includes('placas conjuntas') || n.includes('placa conjuntas'))
    return styles.rtTagPurple
  if (n.includes('other')) return styles.rtTagRed
  if (n.includes('atlas')) return styles.rtTagDefault
  return styles.rtTagDefault
}

function mapOutToDraft(f: TicketFichaOut): TicketFichaUpdateIn {
  return {
    ticket_type_id: f.ticket_type_id,
    procedure_number: f.procedure_number?.trim()
      ? f.procedure_number.trim()
      : null,
    official_letter_number: (() => {
      const t = f.official_letter_number?.trim()
      if (!t) return null
      const n = normalizeNumeroOficio(t)
      return n || null
    })(),
    nature_id: f.nature_id?.trim() ? f.nature_id.trim() : null,
    has_press_alias: f.has_press_alias,
    press_alias: f.press_alias?.trim() ? f.press_alias.trim() : null,
    article_link: f.article_link?.trim() ? f.article_link.trim() : null,
    sei_process_number: f.sei_process_number?.trim()
      ? f.sei_process_number.trim()
      : null,
    sei_process_link: f.sei_process_link?.trim()
      ? f.sei_process_link.trim()
      : null,
  }
}

function normalizeHttpUrl(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  for (const candidate of [t, `https://${t}`]) {
    try {
      return new URL(candidate).href
    } catch {
      /* tenta próximo */
    }
  }
  return null
}

function buildChamadoPayload(
  draft: TicketFichaUpdateIn,
): TicketFichaUpdateIn | null {
  if (!draft.ticket_type_id?.trim()) {
    toast.error('Selecione o tipo de demanda.')
    return null
  }

  const oficio = normalizeNumeroOficio(
    draft.official_letter_number?.trim() ?? '',
  )
  const proc = draft.procedure_number?.trim() ?? ''
  if (oficio && !/^[A-Z0-9/]+$/.test(oficio)) {
    toast.error(
      'Nº de ofício: use apenas letras, números e barra (/), ou deixe em branco.',
    )
    return null
  }
  if (proc.length > MAX_OFICIO_PROC) {
    toast.error(`Nº de procedimento: no máximo ${MAX_OFICIO_PROC} caracteres.`)
    return null
  }

  const apelido = draft.press_alias?.trim() ?? ''
  if (apelido.length > MAX_APELIDO) {
    toast.error(`Apelido: no máximo ${MAX_APELIDO} caracteres.`)
    return null
  }

  let linkOut: string | null = null
  const linkRaw = draft.article_link?.trim() ?? ''
  if (linkRaw) {
    const normalized = normalizeHttpUrl(linkRaw)
    if (!normalized) {
      toast.error('Informe um link válido (URL) para a matéria.')
      return null
    }
    linkOut = normalized
  }

  const numeroSei = draft.sei_process_number?.trim() ?? ''
  if (numeroSei.length > MAX_NUMERO_SEI) {
    toast.error(`Nº SEI: no máximo ${MAX_NUMERO_SEI} caracteres.`)
    return null
  }

  let linkSeiOut: string | null = null
  const linkSeiRaw = draft.sei_process_link?.trim() ?? ''
  if (linkSeiRaw) {
    if (linkSeiRaw.length > MAX_LINK_SEI) {
      toast.error(`Link SEI: no máximo ${MAX_LINK_SEI} caracteres.`)
      return null
    }
    const normalized = normalizeHttpUrl(linkSeiRaw)
    if (!normalized) {
      toast.error('Informe um link válido (URL) para o processo SEI.')
      return null
    }
    linkSeiOut = normalized
  }

  return {
    ticket_type_id: draft.ticket_type_id.trim(),
    official_letter_number: oficio || null,
    procedure_number: proc || null,
    nature_id: draft.nature_id?.trim() ? draft.nature_id.trim() : null,
    has_press_alias: draft.has_press_alias,
    press_alias: apelido || null,
    article_link: linkOut,
    sei_process_number: numeroSei || null,
    sei_process_link: linkSeiOut,
  }
}

export const TicketDetailTabChamado = forwardRef<TicketDetailTabHandle, Props>(
  function TicketDetailTabChamado(
    { ticketId, ticketStateId, ticketStatus },
    ref,
  ) {
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [draft, setDraft] = useState<TicketFichaUpdateIn | null>(null)
    const isEditingRef = useRef(isEditing)
    const draftRef = useRef(draft)
    const fichaRef = useRef<TicketFichaOut | undefined>(undefined)

    isEditingRef.current = isEditing
    draftRef.current = draft

    const fichaQuery = useQuery({
      queryKey: ['ticket', ticketId, 'ficha'],
      queryFn: () => getTicketFicha(ticketId),
    })

    const ticketTypesQuery = useQuery({
      queryKey: ['ticket-types', 'select', 'chamado-tab'],
      queryFn: () => getTicketTypes({ isActive: true }),
      enabled: isEditing,
    })

    const ticketNaturesQuery = useQuery({
      queryKey: ['ticket-natures', 'select', 'chamado-tab'],
      queryFn: () => getTicketNatures({ isActive: true }),
      enabled: isEditing,
    })

    const ficha = fichaQuery.data
    fichaRef.current = ficha

    useEffect(() => {
      if (!ficha || isEditing) return
      setDraft(mapOutToDraft(ficha))
    }, [ficha, isEditing])

    const ticketTypeOptions = useMemo((): TicketType[] => {
      const list = [...(ticketTypesQuery.data?.data ?? [])]
      if (
        ficha?.ticket_type_id &&
        !list.some((t) => t.id === ficha.ticket_type_id)
      ) {
        list.unshift({
          id: ficha.ticket_type_id,
          name: ficha.ticket_type_name || 'Tipo de demanda',
          isActive: true,
        })
      }
      return list
    }, [ficha?.ticket_type_id, ficha?.ticket_type_name, ticketTypesQuery.data])

    const updateMutation = useMutation({
      mutationFn: (payload: TicketFichaUpdateIn) =>
        updateTicketFicha(ticketId, payload),
      onSuccess: () => {
        toast.success('Ficha da demanda atualizada.')
        setIsEditing(false)
        queryClient
          .invalidateQueries({ queryKey: ['ticket', ticketId] })
          .catch(() => {})
        queryClient
          .invalidateQueries({
            queryKey: ['ticket', ticketId, 'ficha'],
          })
          .catch(() => {})
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error))
      },
    })

    const beginEdit = useCallback(() => {
      if (!ficha) return
      setDraft(mapOutToDraft(ficha))
      setIsEditing(true)
    }, [ficha])

    const cancelEdit = useCallback(() => {
      if (ficha) setDraft(mapOutToDraft(ficha))
      setIsEditing(false)
    }, [ficha])

    const saveDraft = useCallback(async (): Promise<boolean> => {
      const currentDraft = draftRef.current
      if (!currentDraft) return false
      const payload = buildChamadoPayload(currentDraft)
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
          if (!isEditingRef.current || !draftRef.current || !fichaRef.current) {
            return false
          }
          const baseline = mapOutToDraft(fichaRef.current)
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

    if (fichaQuery.isLoading) {
      return (
        <div className={styles.panel} role="tabpanel">
          <p className={styles.loading}>Carregando ficha da demanda…</p>
        </div>
      )
    }

    if (fichaQuery.isError || !ficha) {
      const msg = isApiError(fichaQuery.error)
        ? getApiErrorMessage(fichaQuery.error)
        : 'Não foi possível carregar a ficha da demanda.'
      return (
        <div className={styles.panel} role="tabpanel">
          <p className={styles.error}>{msg}</p>
        </div>
      )
    }

    const view = ficha
    const d = isEditing && draft ? draft : mapOutToDraft(view)
    const relacionados = view.related_tickets ?? []

    const tipoNomeTrim = view.ticket_type_name?.trim() ?? ''
    const hasTipoNome = tipoNomeTrim.length > 0
    const tipoNomeReadonly = hasTipoNome ? tipoNomeTrim : displayText(null)

    const naturezas = ticketNaturesQuery.data?.data ?? []
    const pressSimNao = d.has_press_alias ? 'Sim' : 'Não'
    const linkRaw =
      (isEditing && draft ? draft.article_link : view.article_link)?.trim() ??
      ''
    const showSeiFields = shouldShowTicketSeiFields(ticketStateId, ticketStatus)
    const linkSeiRaw =
      (isEditing && draft
        ? draft.sei_process_link
        : view.sei_process_link
      )?.trim() ?? ''

    return (
      <div className={styles.panel} role="tabpanel">
        <div className={styles.fieldStack}>
          <div className={styles.chamadoRows}>
            <div className={styles.chamadoTwoCol}>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Tipo de demanda</span>
                </div>
                {isEditing ? (
                  <Select
                    value={
                      d.ticket_type_id.trim() ? d.ticket_type_id : undefined
                    }
                    onValueChange={(v) =>
                      setDraft((prev) =>
                        prev ? { ...prev, ticket_type_id: v } : prev,
                      )
                    }
                    disabled={ticketTypesQuery.isLoading}
                  >
                    <SelectTrigger
                      className={`h-11 ${styles.detailSelectTrigger} ${styles.solicitanteEditSelectTrigger}`}
                    >
                      <SelectValue
                        placeholder={
                          ticketTypesQuery.isLoading
                            ? 'Carregando…'
                            : 'Selecione'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className={styles.detailSelectContent}>
                      {ticketTypesQuery.isLoading
                        ? null
                        : ticketTypeOptions.map((t) => (
                            <SelectItem
                              key={t.id}
                              value={t.id}
                              className={styles.detailSelectItem}
                            >
                              {t.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {tipoNomeReadonly}
                  </div>
                )}
              </div>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Nº interno</span>
                </div>
                <div
                  className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                >
                  {formatNumeroInterno(view.internal_number ?? null)}
                </div>
              </div>
            </div>

            <div className={styles.chamadoTwoCol}>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>Nº de ofício</span>
                </div>
                {isEditing ? (
                  <input
                    className={`${styles.editableField} ${styles.solicitanteEditField}`}
                    value={d.official_letter_number ?? ''}
                    autoComplete="off"
                    maxLength={CREATE_STR_LIMITS.official_letter_number}
                    onBlur={() =>
                      setDraft((prev) => {
                        if (!prev) return prev
                        const raw = (prev.official_letter_number ?? '').trim()
                        if (!raw)
                          return { ...prev, official_letter_number: null }
                        const normalized = normalizeNumeroOficio(raw)
                        return normalized === prev.official_letter_number
                          ? prev
                          : {
                              ...prev,
                              official_letter_number: normalized || null,
                            }
                      })
                    }
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              official_letter_number:
                                maskNumeroOficio(e.target.value) || null,
                            }
                          : prev,
                      )
                    }
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.official_letter_number)}
                  </div>
                )}
              </div>
              <div className={styles.chamadoCol}>
                <div className={styles.subLabel}>
                  <span className={styles.subLabelText}>
                    Nº de procedimento
                  </span>
                </div>
                {isEditing ? (
                  <input
                    className={`${styles.editableField} ${styles.solicitanteEditField}`}
                    value={d.procedure_number ?? ''}
                    maxLength={MAX_OFICIO_PROC}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              procedure_number: e.target.value || null,
                            }
                          : prev,
                      )
                    }
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.procedure_number)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.chamadoNatureFull}>
              <span className={styles.fieldLabelUpper}>Natureza</span>
              {isEditing ? (
                <Select
                  value={d.nature_id?.trim() ? d.nature_id : undefined}
                  onValueChange={(v) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            nature_id: v.trim() ? v : null,
                          }
                        : prev,
                    )
                  }
                  disabled={ticketNaturesQuery.isLoading}
                >
                  <SelectTrigger
                    className={`h-11 ${styles.detailSelectTrigger} ${styles.solicitanteEditSelectTrigger}`}
                  >
                    <SelectValue
                      placeholder={
                        ticketNaturesQuery.isLoading
                          ? 'Carregando…'
                          : 'Selecione'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className={styles.detailSelectContent}>
                    {ticketNaturesQuery.isLoading
                      ? null
                      : naturezas.map((n) => (
                          <SelectItem
                            key={n.id}
                            value={n.id}
                            className={styles.detailSelectItem}
                          >
                            {n.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className={styles.readonlySelect}>
                  <span className={styles.solicitanteReadOnlyText}>
                    {view.nature_name?.trim() ? view.nature_name : 'Selecione'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={styles.readonlySelectMuted}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.fieldBlock}>
            <div>
              <p className={styles.sectionTitle} role="heading" aria-level={2}>
                Apelido da Demanda
              </p>
              <span className={styles.sectionHint}>
                A demanda tem relevância na mídia?
              </span>
            </div>
            <div className={styles.fieldStack}>
              <div className={styles.chamadoNatureFull}>
                <span className={styles.fieldLabelUpper}>
                  Tem apelido pela imprensa?
                </span>
                {isEditing ? (
                  <Select
                    value={d.has_press_alias ? 'sim' : 'nao'}
                    onValueChange={(v) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              has_press_alias: v === 'sim',
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger
                      className={`h-11 ${styles.detailSelectTrigger} ${styles.solicitanteEditSelectTrigger}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={styles.detailSelectContent}>
                      <SelectItem
                        value="nao"
                        className={styles.detailSelectItem}
                      >
                        Não
                      </SelectItem>
                      <SelectItem
                        value="sim"
                        className={styles.detailSelectItem}
                      >
                        Sim
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className={styles.readonlySelect}>
                    <span className={styles.solicitanteReadOnlyText}>
                      {pressSimNao}
                    </span>
                    <ChevronDown
                      size={20}
                      className={styles.readonlySelectMuted}
                      aria-hidden
                    />
                  </div>
                )}
              </div>
              <div className={styles.chamadoTwoCol}>
                <div className={styles.chamadoCol}>
                  <div className={styles.subLabel}>
                    <span className={styles.subLabelText}>
                      Apelido pela imprensa
                    </span>
                  </div>
                  {isEditing ? (
                    <input
                      className={`${styles.editableField} ${styles.solicitanteEditField}`}
                      value={d.press_alias ?? ''}
                      maxLength={MAX_APELIDO}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                press_alias: e.target.value || null,
                              }
                            : prev,
                        )
                      }
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                    >
                      {displayText(view.press_alias)}
                    </div>
                  )}
                </div>
                <div className={styles.chamadoCol}>
                  <div className={styles.subLabel}>
                    <span className={styles.subLabelText}>Link da matéria</span>
                  </div>
                  {isEditing ? (
                    <input
                      className={`${styles.editableField} ${styles.solicitanteEditField}`}
                      type="url"
                      value={d.article_link ?? ''}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? { ...prev, article_link: e.target.value || null }
                            : prev,
                        )
                      }
                      placeholder="https://…"
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.readonlyInputLinkCell}`}
                    >
                      {linkRaw ? (
                        <a
                          href={linkRaw}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkExternal}
                        >
                          {linkRaw}
                        </a>
                      ) : (
                        <span className={styles.readonlyInputMuted}>—</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showSeiFields ? (
            <div className={styles.fieldBlock}>
              <div>
                <p
                  className={styles.sectionTitle}
                  role="heading"
                  aria-level={2}
                >
                  Processo SEI
                </p>
              </div>
              <div className={styles.chamadoTwoCol}>
                <div className={styles.chamadoCol}>
                  <div className={styles.subLabel}>
                    <span className={styles.subLabelText}>Número SEI</span>
                  </div>
                  {isEditing ? (
                    <input
                      className={`${styles.editableField} ${styles.solicitanteEditField}`}
                      value={d.sei_process_number ?? ''}
                      maxLength={MAX_NUMERO_SEI}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                sei_process_number: e.target.value || null,
                              }
                            : prev,
                        )
                      }
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                    >
                      {displayText(view.sei_process_number)}
                    </div>
                  )}
                </div>
                <div className={styles.chamadoCol}>
                  <div className={styles.subLabel}>
                    <span className={styles.subLabelText}>Link SEI</span>
                  </div>
                  {isEditing ? (
                    <input
                      className={`${styles.editableField} ${styles.solicitanteEditField}`}
                      type="url"
                      value={d.sei_process_link ?? ''}
                      maxLength={MAX_LINK_SEI}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                sei_process_link: e.target.value || null,
                              }
                            : prev,
                        )
                      }
                      placeholder="https://…"
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.readonlyInputLinkCell}`}
                    >
                      {linkSeiRaw ? (
                        <a
                          href={linkSeiRaw}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.linkExternal}
                        >
                          {linkSeiRaw}
                        </a>
                      ) : (
                        <span className={styles.readonlyInputMuted}>—</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.fieldBlock}>
            <div>
              <p className={styles.sectionTitle} role="heading" aria-level={2}>
                Demandas relacionadas
              </p>
              <span className={styles.sectionHint}>
                Demandas que possuem o mesmo nº de procedimento:
              </span>
            </div>

            <div className={styles.relatedTableWrap}>
              <table className={styles.relatedTable}>
                <thead>
                  <tr>
                    <th>Demanda</th>
                    <th>Equipe</th>
                    <th>Responsável</th>
                    <th>Serviços</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {relacionados.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <span className={styles.readonlyInputMuted}>
                          Nenhuma outra demanda com o mesmo nº de procedimento.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    relacionados.map((row) => {
                      const preview = row.services.slice(0, SERVICE_PREVIEW)
                      const extra = Math.max(
                        row.services.length - preview.length,
                        0,
                      )
                      return (
                        <tr key={row.id}>
                          <td>
                            <Link
                              href={`/demandas/${encodeURIComponent(row.id)}`}
                              className={styles.relatedChamadoLink}
                            >
                              {formatNumeroInterno(row.internal_number)}
                            </Link>
                          </td>
                          <td>{displayText(row.team)}</td>
                          <td>{displayText(row.assignee)}</td>
                          <td>
                            <div className={styles.relatedServices}>
                              {preview.map((svc) => (
                                <span
                                  key={`${row.id}-${svc}`}
                                  className={`${styles.rtTag} ${rtTagClass(svc)}`}
                                >
                                  <Tag size={12} strokeWidth={2} aria-hidden />
                                  {svc}
                                </span>
                              ))}
                              {extra > 0 ? (
                                <span className={styles.rtExtraCount}>
                                  +{extra}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {formatTicketStatusLabel(row.status)}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
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
  },
)
