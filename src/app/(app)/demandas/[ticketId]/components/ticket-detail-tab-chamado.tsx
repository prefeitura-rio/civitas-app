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
  if (n.includes('outros')) return styles.rtTagRed
  if (n.includes('atlas')) return styles.rtTagDefault
  return styles.rtTagDefault
}

function mapOutToDraft(f: TicketFichaOut): TicketFichaUpdateIn {
  return {
    tipo_chamado_id: f.tipo_chamado_id,
    numero_procedimento: f.numero_procedimento?.trim()
      ? f.numero_procedimento.trim()
      : null,
    numero_oficio: (() => {
      const t = f.numero_oficio?.trim()
      if (!t) return null
      const n = normalizeNumeroOficio(t)
      return n || null
    })(),
    natureza_id: f.natureza_id?.trim() ? f.natureza_id.trim() : null,
    possui_apelido_imprensa: f.possui_apelido_imprensa,
    apelido_imprensa: f.apelido_imprensa?.trim()
      ? f.apelido_imprensa.trim()
      : null,
    link_materia: f.link_materia?.trim() ? f.link_materia.trim() : null,
    numero_processo_sei: f.numero_processo_sei?.trim()
      ? f.numero_processo_sei.trim()
      : null,
    link_processo_sei: f.link_processo_sei?.trim()
      ? f.link_processo_sei.trim()
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
  if (!draft.tipo_chamado_id?.trim()) {
    toast.error('Selecione o tipo de demanda.')
    return null
  }

  const oficio = normalizeNumeroOficio(draft.numero_oficio?.trim() ?? '')
  const proc = draft.numero_procedimento?.trim() ?? ''
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

  const apelido = draft.apelido_imprensa?.trim() ?? ''
  if (apelido.length > MAX_APELIDO) {
    toast.error(`Apelido: no máximo ${MAX_APELIDO} caracteres.`)
    return null
  }

  let linkOut: string | null = null
  const linkRaw = draft.link_materia?.trim() ?? ''
  if (linkRaw) {
    const normalized = normalizeHttpUrl(linkRaw)
    if (!normalized) {
      toast.error('Informe um link válido (URL) para a matéria.')
      return null
    }
    linkOut = normalized
  }

  const numeroSei = draft.numero_processo_sei?.trim() ?? ''
  if (numeroSei.length > MAX_NUMERO_SEI) {
    toast.error(`Nº SEI: no máximo ${MAX_NUMERO_SEI} caracteres.`)
    return null
  }

  let linkSeiOut: string | null = null
  const linkSeiRaw = draft.link_processo_sei?.trim() ?? ''
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
    tipo_chamado_id: draft.tipo_chamado_id.trim(),
    numero_oficio: oficio || null,
    numero_procedimento: proc || null,
    natureza_id: draft.natureza_id?.trim() ? draft.natureza_id.trim() : null,
    possui_apelido_imprensa: draft.possui_apelido_imprensa,
    apelido_imprensa: apelido || null,
    link_materia: linkOut,
    numero_processo_sei: numeroSei || null,
    link_processo_sei: linkSeiOut,
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
        ficha?.tipo_chamado_id &&
        !list.some((t) => t.id === ficha.tipo_chamado_id)
      ) {
        list.unshift({
          id: ficha.tipo_chamado_id,
          name: ficha.tipo_chamado_nome || 'Tipo de demanda',
          isActive: true,
        })
      }
      return list
    }, [
      ficha?.tipo_chamado_id,
      ficha?.tipo_chamado_nome,
      ticketTypesQuery.data,
    ])

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
    const relacionados = view.chamados_relacionados ?? []

    const tipoNomeTrim = view.tipo_chamado_nome?.trim() ?? ''
    const hasTipoNome = tipoNomeTrim.length > 0
    const tipoNomeReadonly = hasTipoNome ? tipoNomeTrim : displayText(null)

    const naturezas = ticketNaturesQuery.data?.data ?? []
    const pressSimNao = d.possui_apelido_imprensa ? 'Sim' : 'Não'
    const linkRaw =
      (isEditing && draft ? draft.link_materia : view.link_materia)?.trim() ??
      ''
    const showSeiFields = shouldShowTicketSeiFields(ticketStateId, ticketStatus)
    const linkSeiRaw =
      (isEditing && draft
        ? draft.link_processo_sei
        : view.link_processo_sei
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
                      d.tipo_chamado_id.trim() ? d.tipo_chamado_id : undefined
                    }
                    onValueChange={(v) =>
                      setDraft((prev) =>
                        prev ? { ...prev, tipo_chamado_id: v } : prev,
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
                  {formatNumeroInterno(view.numero_interno ?? null)}
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
                    value={d.numero_oficio ?? ''}
                    autoComplete="off"
                    maxLength={CREATE_STR_LIMITS.numero_oficio}
                    onBlur={() =>
                      setDraft((prev) => {
                        if (!prev) return prev
                        const raw = (prev.numero_oficio ?? '').trim()
                        if (!raw) return { ...prev, numero_oficio: null }
                        const normalized = normalizeNumeroOficio(raw)
                        return normalized === prev.numero_oficio
                          ? prev
                          : { ...prev, numero_oficio: normalized || null }
                      })
                    }
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              numero_oficio:
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
                    {displayText(view.numero_oficio)}
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
                    value={d.numero_procedimento ?? ''}
                    maxLength={MAX_OFICIO_PROC}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              numero_procedimento: e.target.value || null,
                            }
                          : prev,
                      )
                    }
                  />
                ) : (
                  <div
                    className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                  >
                    {displayText(view.numero_procedimento)}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.chamadoNatureFull}>
              <span className={styles.fieldLabelUpper}>Natureza</span>
              {isEditing ? (
                <Select
                  value={d.natureza_id?.trim() ? d.natureza_id : undefined}
                  onValueChange={(v) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            natureza_id: v.trim() ? v : null,
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
                    {view.natureza_nome?.trim()
                      ? view.natureza_nome
                      : 'Selecione'}
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
                    value={d.possui_apelido_imprensa ? 'sim' : 'nao'}
                    onValueChange={(v) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              possui_apelido_imprensa: v === 'sim',
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
                      value={d.apelido_imprensa ?? ''}
                      maxLength={MAX_APELIDO}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                apelido_imprensa: e.target.value || null,
                              }
                            : prev,
                        )
                      }
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                    >
                      {displayText(view.apelido_imprensa)}
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
                      value={d.link_materia ?? ''}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? { ...prev, link_materia: e.target.value || null }
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
                      value={d.numero_processo_sei ?? ''}
                      maxLength={MAX_NUMERO_SEI}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                numero_processo_sei: e.target.value || null,
                              }
                            : prev,
                        )
                      }
                    />
                  ) : (
                    <div
                      className={`${styles.readonlyInput} ${styles.solicitanteReadOnlyText}`}
                    >
                      {displayText(view.numero_processo_sei)}
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
                      value={d.link_processo_sei ?? ''}
                      maxLength={MAX_LINK_SEI}
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? {
                                ...prev,
                                link_processo_sei: e.target.value || null,
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
                      const preview = row.servicos.slice(0, SERVICE_PREVIEW)
                      const extra = Math.max(
                        row.servicos.length - preview.length,
                        0,
                      )
                      return (
                        <tr key={row.id}>
                          <td>
                            <Link
                              href={`/demandas/${encodeURIComponent(row.id)}`}
                              className={styles.relatedChamadoLink}
                            >
                              {formatNumeroInterno(row.numero_interno)}
                            </Link>
                          </td>
                          <td>{displayText(row.equipe)}</td>
                          <td>{displayText(row.responsavel)}</td>
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
